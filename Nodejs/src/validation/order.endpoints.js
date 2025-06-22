import { roles } from "../middlewares/auth.js";
export const endpoints = {
  createOrder : [roles.Client] ,
  applyForProject : [roles.Artist],
  homepage: [roles.Admin, roles.Client, roles.Artist]
};