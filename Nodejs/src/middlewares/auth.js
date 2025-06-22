import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
export const roles = {
  Client: "Client",
  Admin: "Admin",
  Artist: "Artist",
};
export let authToken = null;
export const auth = (acceptRoles = [roles.Client]) => {
  return async (req, res, next) => {
    // try {
    console.log({ bb: req.body });
    const { authorization } = req.headers;
    console.log(req.headers);
    console.log({ authorization });
    if (!authorization?.startsWith(process.env.BearerKey)) {
      // res.status(400).json({ message: "In-valid Bearer key" })
      res.status(400).json({ message: "Invalid Bearer Key" });
    } else {
      authToken = authorization.split(process.env.BearerKey)[1];
      const decoded = jwt.verify(authToken, process.env.tokenSignature);
      if (!decoded?.id) {
        // res.status(400).json({ message: "In-valid token payload " })
        //next(new Error("Invalid token payload ", { cause: 400 }))
        res.status(400).json({ message: "Invalid Token Payload" });
      } else {
        const user = await UserModel.findById(decoded.id).select(
          "email username userType blocked isAccepted"
        );
        if (!user) {
          res.status(404).json({ message: "Not register user" });
          //next(new Error("Not register user ", { cause: 404 }))
        } else {
          if (!acceptRoles.includes(user.userType)) {
            //next(new Error("Not authorized user ", { cause: 403 }))
            return res.status(403).json({ message: "Not authorized user" });
          }
          if (user.blocked === true) {
            return res
              .status(403)
              .json({ message: "Your account has been blocked" });
          }
          if (user.userType === "Admin" && user.isAccepted === false) {
            return res
              .status(403)
              .json({ message: "Your account has not been approved yet" });
          }
          req.user = user;
          next();
        }
      }
    }
    // } catch (error) {
    //     res.status(500).json({ message: "catch error", error })

    // }
  };
};

// export const auth = (
//   acceptRoles = [roles.Client]
// ) => {
//   return async (req, res,next) => {
//     // try {
//     console.log({ bb: req.body });
//     const { authorization } = req.headers;
//     console.log({ authorization });
//     if (!authorization?.startsWith(process.env.BearerKey)) {
//       // res.status(400).json({ message: "In-valid Bearer key" })
//       res.status(400).json({ message: "Invalid Bearer Key" });
//     } else {
//       const token = authorization.split(process.env.BearerKey)[1];
//       const decoded = jwt.verify(token, process.env.tokenSignature);
//       if (!decoded?.id) {
//         // res.status(400).json({ message: "In-valid token payload " })
//         //next(new Error("Invalid token payload ", { cause: 400 }))
//         res.status(400).json({ message: "Invalid Token Payload" });
//       } else {
//         const user = await UserModel.findById(decoded.id).select(
//           "email username userType"
//         );
//         if (!user) {
//           res.status(404).json({ message: "Not register user" });
//           //next(new Error("Not register user ", { cause: 404 }))
//         } else {
//           if (acceptRoles.includes(user.userType)) {
//             req.user = user;
//             next();
//           } else {
//             //next(new Error("Not authorized user ", { cause: 403 }))
//             res.status(403).json({ message: "Not authorized user" });
//           }
//         }
//       }
//     }
//     // } catch (error) {
//     //     res.status(500).json({ message: "catch error", error })

//     // }
//   };
// };
