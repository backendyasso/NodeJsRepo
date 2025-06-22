import UserModel from "../models/user.model.js";
import otpGenerator from "otp-generator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sendEmail.js";
import { roles } from "../middlewares/auth.js";
export const signUp = async (req, res) => {
  const { username, password, cpassword, email, userType, ArtistInfo,address } =
    req.body;
  if (password == cpassword) {
    const userChecker = await UserModel.findOne({ email });
    if (userChecker) {
      res.status(409).json({ message: "user already exists" });
    } else {
      let hashed = await bcryptjs.hash(
        password,
        parseInt(process.env.saltRound)
      );
      if (![roles.Admin, roles.Client, roles.Artist].includes(userType)) {
        return res.status(400).json({ message: "Invalid userType" });
      }

      let user;
      if (userType === roles.Artist) {
        if (!ArtistInfo) {
          return res.status(400).json({ message: "required ArtistInfo" });
        }
        user = new UserModel({
          username,
          password: hashed,
          email,
          userType,
          ArtistInfo,
          address
        });
      } else {
        if (userType === roles.Admin || userType === roles.Client) {
          if (ArtistInfo) {
            return res.status(400).json({ message: "Only Artists allowed" });
          }
        }
       user = new UserModel({ username, password: hashed, email, userType , ArtistInfo ,address });
      }
      let token = jwt.sign({ id: user._id }, process.env.JWTEMAILKEY);
      console.log(token);
      //let message = `<a href="http://localhost:3000/api/v1/auth/confirmEmail/${token}">please click here to confirm</a>`;
      //let result = await sendEmail({ dest: email, message: message });

      let saveUser = await user.save();
      return res.status(201).json({ message: "done", saveUser, token: token });
    }
  } else {
    res.json({ message: "please enter your password properly" });
  }
};

// export const confirmEmail = async (req, res) => {
//   const { token } = req.params;
//   let decoded = jwt.verify(token, process.env.JWTEMAILKEY);
//   if (decoded) {
//     console.log(decoded);
//     let user = await UserModel.findOne({
//       _id: decoded.id,
//       confirm_email: false,
//     });
//     if (user) {
//       let updateuser = await UserModel.findByIdAndUpdate(
//         decoded.id,
//         { confirm_email: true },
//         { new: true }
//       );
//       res.json({ message: "updated Successfully", updateuser });
//     } else {
//       res.json({ message: "you're already confirmed or invalid token" });
//     }
//   } else {
//     res.json("invalid token");
//   }
// };

export let globalToken = null;
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await UserModel.findOne({ email });
  if (findUser) {
    let matched = await bcryptjs.compare(password, findUser.password);
    if (matched) {
      globalToken = jwt.sign(
        { isLogin: true, id: findUser._id },
        process.env.tokenSignature
      );

      res.json({
        message: "successfully logged in",
        findUser,
        token: globalToken,
      });
    } else {
      res.json({ message: "incorrect password" });
    }
  } else {
    res.json({ message: "you need to signUp first :'''" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { code, Rpassword, email } = req.body;
    let user = await UserModel.findOne({ email, code });
    if (!user) {
      res.json({ message: "user not found" });
    } else {
      let hashedPass = await bcryptjs.hash(
        Rpassword,
        parseInt(process.env.saltRound)
      );
      let forgetter = await UserModel.findByIdAndUpdate(
        user._id,
        { code: null, password: hashedPass },
        { new: true }
      );
      res.json({ message: "password Updated", forgetPassword });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
};

export const sendcode = async (req, res) => {
  const { email } = req.body;
  let user = await UserModel.findOne({ email });
  if (!user) {
    res.json({ message: "you haven't register yet" });
  } else {
    //let OTPcode = Math.floor(Math.random() * (1999 -1940 + 1) + 1940);
    let OTPcode = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(OTPcode);
    let coder = await UserModel.findByIdAndUpdate(user._id, { code: OTPcode });
    let message = `your code is ${OTPcode}`;
    sendEmail({ dest: email, message: message });
    res.json({ message: "Code Sent Successfully", coder });
  }
};
// import UserModel from "../models/user.model.js";
// import otpGenerator from "otp-generator";
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../services/sendEmail.js";
// import { roles } from "../middlewares/auth.js";
// export const signUp = async (req, res) => {
//   const { username, password, cpassword, email, userType, ArtistInfo } =
//     req.body;
//   if (password == cpassword) {
//     const userChecker = await UserModel.findOne({ email });
//     if (userChecker) {
//       res.status(409).json({ message: "user already exists" });
//     } else {
//       let hashed = await bcryptjs.hash(
//         password,
//         parseInt(process.env.saltRound)
//       );
//       if (![roles.Admin, roles.Client, roles.Artist].includes(userType)) {
//         return res.status(400).json({ message: "Invalid userType" });
//       }

//       let user;
//       if (userType === roles.Artist.toLowerCase()) {
//         if (!ArtistInfo) {
//           return res.status(400).json({ message: "required ArtistInfo" });
//         }
//         user = new UserModel({
//           username,
//           password: hashed,
//           email,
//           userType,
//           ArtistInfo,
//         });
//       } else {
//         if (userType === roles.Admin || userType === roles.Client) {
//           if (ArtistInfo) {
//             return res.status(400).json({ message: "Only Artists allowed" });
//           }
//         }
//        user = new UserModel({ username, password: hashed, email, userType , ArtistInfo  });
//       }
//       let token = jwt.sign({ id: user._id }, process.env.JWTEMAILKEY);
//       console.log(token);
//       let message = `<a href="http://localhost:5000/api/v1/auth/confirmEmail/${token}">please click here to confirm</a>`;
//       let result = await sendEmail({ dest: email, message: message });
//       if (result.accepted.length) {
//         let saveUser = await user.save();
//         return res.status(201).json({ message: "done", saveUser });
//       }
//     }
//   } else {
//     res.json({ message: "please enter your password properly" });
//   }
// };

// export const confirmEmail = async (req, res) => {
//   const { token } = req.params;
//   let decoded = jwt.verify(token, process.env.JWTEMAILKEY);
//   if (decoded) {
//     console.log(decoded);
//     let user = await UserModel.findOne({
//       _id: decoded.id,
//       confirm_email: false,
//     });
//     if (user) {
//       let updateuser = await UserModel.findByIdAndUpdate(
//         decoded.id,
//         { confirm_email: true },
//         { new: true }
//       );
//       res.json({ message: "updated Successfully", updateuser });
//     } else {
//       res.json({ message: "you're already confirmed or invalid token" });
//     }
//   } else {
//     res.json("invalid token");
//   }
// };

// export const signIn = async (req, res) => {
//   const { email, password } = req.body;
//   const findUser = await UserModel.findOne({ email });
//   if (findUser) {
//     let matched = await bcryptjs.compare(password, findUser.password);
//     if (matched) {
//       if (findUser.confirm_email) {
//         let token = jwt.sign(
//           { isLogin: true, id: findUser._id },
//           process.env.tokenSignature
//         );
//         console.log(token);
//         res.json({ message: "successfully logged in", findUser, token });
//       } else {
//         res.json({ message: "confirm your email first" });
//       }
//     } else {
//       res.json({ message: "incorrect password" });
//     }
//   } else {
//     res.json({ message: "you need to signUp first :'''" });
//   }
// };

// export const forgetPassword = async (req, res) => {
//   try {
//     const { code, Rpassword, email } = req.body;
//     let user = await UserModel.findOne({ email, code });
//     if (!user) {
//       res.json({ message: "user not found" });
//     } else {
//       let hashedPass = await bcryptjs.hash(
//         Rpassword,
//         parseInt(process.env.saltRound)
//       );
//       let forgetter = await UserModel.findByIdAndUpdate(
//         user._id,
//         { code: null, password: hashedPass },
//         { new: true }
//       );
//       res.json({ message: "password Updated", forgetPassword });
//     }
//   } catch (error) {
//     res.json({ message: "error", error });
//   }
// };

// export const sendcode = async (req, res) => {
//   const { email } = req.body;
//   let user = await UserModel.findOne({ email });
//   if (!user) {
//     res.json({ message: "you haven't register yet" });
//   } else {
//     //let OTPcode = Math.floor(Math.random() * (1999 -1940 + 1) + 1940);
//     let OTPcode = otpGenerator.generate(4, {
//       upperCaseAlphabets: false,
//       specialChars: false,
//     });
//     console.log(OTPcode);
//     let coder = await UserModel.findByIdAndUpdate(user._id, { code: OTPcode });
//     let message = `your code is ${OTPcode}`;
//     sendEmail({ dest: email, message: message });
//     res.json({ message: "Code Sent Successfully", coder });
//   }
// };
