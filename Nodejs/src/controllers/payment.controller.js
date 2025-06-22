import paypal from "@paypal/checkout-server-sdk";
import { getHerCart } from "./cart.controller.js";
import cartModel from "../models/cart.model.js";
import CourseModel from "../models/course.model.js";
import OrderModel from "../models/order.model.js";
import contractModel from "../models/contract.model.js";
import { updateChatProjects } from "./order.controller.js";
import CommunityModel from "../models/community.model.js";
// import { accessCourse } from "./course.controller.js";
let idiotId =
  "AWB60WyftTsjQq__SQVxNeF0yO9gbBYKbuH2jM6xQP-SG_R52lL1DXAzOy4_0XMXt0bSEMFVfve6mVYh";
let clientSecret =
  "EDMOH6Ew-a9XmtnihZrlVXuhNQ1J3nEOjjov60VOQrmNtXClRw5BtURTn0JFKZaWmxdrnoW_7j2jO5vf";

let environment = new paypal.core.SandboxEnvironment(idiotId, clientSecret);
let carter;
let userId;
let payType;
let contractIds;
let foundedContracts;
export const paypost = async (req, res, next) => {
  contractIds = req.body.contractIds;
  let value;
  let userCart;
  payType = req.body.payType;

  if (payType === "Order") {
    try {
      foundedContracts = await contractModel.find({
        "artistContracts._id": { $in: contractIds },
      });

      let orderPrice = 0;
      foundedContracts.forEach((contract) => {
        contract.artistContracts.forEach((item) => {
          if (contractIds.includes(item._id.toString())) {
            orderPrice += item.price;
          }
        });
      });
      value = orderPrice;
    } catch (error) {
      console.error("Error finding contracts:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    try {
      userCart = await cartModel.findOne({ clientId: req.user._id });
      value = userCart.totalPrice;
    } catch (error) {
      console.error("Error finding user cart:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  console.log("Total value:", value);

  let client = new paypal.core.PayPalHttpClient(environment);
  let request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: value,
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: `http://localhost:${process.env.PORT}/api/v1/paypal/capture`,
          cancel_url: `http://localhost:${process.env.PORT}/api/v1/paypal/cancel`,
        },
      },
    },
  });

  try {
    const { result } = await client.execute(request);
    res.status(200).json({
      payLink: result.links[1].href,
      cart: userCart,
    });

    carter = userCart;
    userId = req.user._id;
    next();
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCapture = async (req, res) => {
  const { token } = req.query;

  const client = new paypal.core.PayPalHttpClient(environment);
  const request = new paypal.orders.OrdersCaptureRequest(token);

  request.requestBody({
    final_capture: true,
    note_to_payer: "Thank you for your payment!",
  });

  const { result } = await client.execute(request);
  console.log(carter);

  console.log(result.purchase_units[0].shipping);
  console.log(payType);
  if (payType === "Order") {
    res.redirect("/api/v1/order/set");
  } else {
    res.redirect("/api/v1/paypal/success");
  }
};
export let payment = null;

export const getSucess = async (req, res) => {
  const courseIds = carter.courses.map((course) => course.courseId);
  let courses = await CourseModel.find({ _id: { $in: courseIds } });
  if (!courses) {
    return res.status(404).json({ error: "Course not found" });
  }

  for (const course of courses) {
    const accessGranted = await course.grantAccessAfterPayment(
      userId,
      courseIds
    );
    if (!accessGranted) {
      return res
        .status(500)
        .json({ error: "Failed to grant access to the course" });
    }
  }
  //res.redirect("/api/v1/course/access");

  //console.log(courses);

  res
    .status(200)
    .json({ message: "Thank you", success: courses, cart: carter });
};
export const getSuccessForCommunity = async (req, res) => {
  const postIds = carter.communityProjects.map((community) => community.postcollection
  .map((postcollection)=>postcollection._id)  )
  const communityProjects = await CommunityModel.find({"postcollection._id": { $in: postIds } });

  if (!communityProjects) {
    return res.status(404).json({ error: "Project not found" });
  }
  const accessGranted = await CommunityModel.grantAccessAfterPaymentcommunity(
  );
  if (!accessGranted) {
    return res .status(500) .json({ error: "Failed " });
  }
   res.status(200) .json({ message: "Thank you", success: communityProjects, cart: carter });
}

// export const setPaid = async (req, res) => {
//   try {
//     // const { contractIds } = req.body;
//     //const { paid } = req.body;

//     const findContracts = await contractModel.find({
//       "artistContracts._id": { $in: contractIds },
//     });
//     // for (const foundedContract of findContracts) {
//     //   const contractsToUpdate = findContracts.artistContracts.filter(
//     //     (contract) => contractIds.includes(contract._id.toString())
//     //   );
//     //   for (const contract of contractsToUpdate) {
//     //     contract.paid = true;
//     //   }
//     findContracts.forEach((contract) =>
//       contract.artistContracts.forEach((pay) => {
//         if (contractIds.includes(pay._id.toString())) {
//           pay.paid = true;
//         }
//       })
//     );
//     await Promise.all(findContracts.map((contract) => contract.save()));
//     const updatedContracts = await contractModel.find({
//       "artistContracts._id": { $in: contractIds },
//     });

//     res
//       .status(200)
//       .json({ message: "Done popo", foundedContracts: updatedContracts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const setPaid = async (req, res) => {
  try {
    //const { contractIds } = req.body;

    const findContracts = await contractModel.find({
      "artistContracts._id": { $in: contractIds },
    });
    findContracts.forEach((contract) =>
      contract.artistContracts.forEach((pay) => {
        if (contractIds.includes(pay._id.toString())) {
          pay.paid = true;
        }
      })
    );
    await Promise.all(findContracts.map((contract) => contract.save()));

    await updateChatProjects(contractIds);
    const updatedContracts = await contractModel.find({
      "artistContracts._id": { $in: contractIds },
    });
    res.status(200).json({ message: "Done popo", updatedContracts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCancel = (req, res) => res.send("Cancelled");
export const world = (req, res) => {
  return res.send("Hello, world!");
};
