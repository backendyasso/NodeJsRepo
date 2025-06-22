import cartModel from "../models/cart.model.js";
import CourseModel from "../models/course.model.js";
import CommunityModel from "../models/community.model.js";
import { paginate } from "../services/pagination.js";
import UserModel from "../models/user.model.js";
export let students = [];
export const createCart = async (req, res) => {
  try {
    const { _id } = req.user;
    let { courses, communityProjects } = req.body;

    let userData = await UserModel.findById({
      _id,
    });

    let coursesId = courses.map((course) => {
      for (let item of userData.enrolledCourses) {
        if (item == course.courseId) {
          return course.courseId;
        }
      }
    });
    console.log(coursesId);
    let cart = await cartModel.findOne({ clientId: _id });

    if (!cart) {
      cart = new cartModel({ clientId: _id });
    }

    for (const courseData of courses) {
      const { courseId } = courseData;

      const existingCourse = cart.courses.find(
        (item) => String(item.courseId) === courseId
      );

      if (!existingCourse && !coursesId.includes(courseId)) {
        students.push(courseId);
        const course = await CourseModel.findById(courseId);

        if (!course) {
          return res
            .status(404)
            .json({ message: `Course with ID ${courseId} not found` });
        }
        cart.courses.push({
          courseId: course._id,
          quantity: cart.courses.length + 1,
          coursesPrice: course.price,
        });
      }
    }

    await cart.save();
    console.log(`there you are ${students}`);
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { courses, communityProjects } = req.body;

    const carter = await cartModel.findById(id);
    if (!carter) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (carter.clientId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this cart" });
    }
    let changesMade = false;

    for (const courseData of courses) {
      const { courseId } = courseData;
      const existingCourse = carter.courses.find(
        (item) => String(item.courseId) === courseId
      );
      if (!existingCourse) {
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return res
            .status(404)
            .json({ message: `Course with ID ${courseId} not found` });
        }
        carter.courses.push({
          courseId: course._id,
          quantity: carter.courses.length,
          coursesPrice: course.price,
        });
        changesMade = true;
      }
    }
    for (const projectData of communityProjects) {
      const { projectId } = projectData;
      const existingProject = carter.communityProjects.find(
        (item) => String(item.projectId) === projectId
      );
      if (!existingProject) {
        const project = await CommunityModel.findById(projectId);
        if (!project) {
          return res
            .status(404)
            .json({ message: `Project with ID ${projectId} not found` });
        }

        carter.communityProjects.push({
          projectId: project._id,
          quantity: carter.communityProjects.length + 1,
          ProjectsPrice: project.price,
        });
        changesMade = true;
      }
    }

    if (!changesMade) {
      return res.status(200).json({ message: "No changes added", carter });
    }

    await carter.save();

    res.status(200).json({ message: "Cart updated successfully", carter });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cartDeleter = async (req, res) => {
  try {
    const { id } = req.params;
    const carter = await cartModel.findById(id);
    if (!carter) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (carter.clientId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this cart" });
    }
    const remover = await cartModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Cart deleted successfully", remover });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const ItemsDeleter = async (req, res) => {
  try {
    const { courseId, projectId } = req.body;
    const { id } = req.params;
    const carta = await cartModel.findById(id);

    if (!carta) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (String(carta.clientId) !== String(req.user._id)) {
      return res.status(401).json({
        message: "You can't remove items from other user's cart you punk",
      });
    }

    let itemDeleted = false;

    if (courseId) {
      const courseIndex = carta.courses.findIndex(
        (course) => course.courseId.toString() === courseId
      );
      if (courseIndex !== -1) {
        carta.courses.splice(courseIndex, 1);
        itemDeleted = true;
      }
    }

    if (projectId) {
      const projectIndex = carta.communityProjects.findIndex(
        (project) => project.projectId.toString() === projectId
      );
      if (projectIndex !== -1) {
        carta.communityProjects.splice(projectIndex, 1);
        itemDeleted = true;
      }
    }

    if (!itemDeleted) {
      return res.status(404).json({ message: "Item not found for deletion" });
    }

    await carta.save();

    res
      .status(200)
      .json({ message: "Item(s) deleted successfully", cart: carta });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHerCart = async (req, res) => {
  try {
    console.log(req.user._id);
    const cart = await cartModel.findOne({ clientId: req.user._id }).populate([
      {
        path: "courses",
        select: "cartType",
        populate: {
          path: "courseId",
          select: "artistId title imageUrl price",
        },
      },
      {
        path: "communityProjects",
        select: "cartType",
        populate: {
          path: "projectId",
          select: "author title image price",
        },
      },
    ]);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart found successfully", cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getHerItems = async (req, res) => {
  try {
    let { page, size } = req.query;
    let { skip, limit } = paginate(page, size);
    const cartId = req.params.id;

    const cart = await cartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const communityProjectIds = cart.communityProjects.map(
      (project) => project.projectId
    );
    const courseIds = cart.courses.map((course) => course.courseId);

    const courses = await CourseModel.find({
      _id: { $in: courseIds },
    })
      .select("artistId title imageUrl price")
      .skip(skip)
      .limit(limit);

    const communityProjects = await CommunityModel.find({
      _id: { $in: communityProjectIds },
    })
      .select("author title image price")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Items paginated successfully",
      courses,
      communityProjects,
    });
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const CartDeleterPerioder = async (req, res) => {
  try {
    const inactiveCarts = await Cart.findById({
      _id: req.params.id,
      updatedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
    });
    if (inactiveCarts) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await Cart.deleteOne({
      _id: inactiveCarts._id,
    });
    res
      .status(200)
      .json({ message: "Cart has been deleted since there is no updates" });

    console.log(` inactive carts deleted.`);
  } catch (error) {
    console.error("Error deleting inactive carts:", error);
  }
};
