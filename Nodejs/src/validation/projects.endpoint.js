import { roles } from "../middlewares/auth.js";
export const endpoints = {
  CreateProject : [roles.Artist] ,
  view : [roles.Artist,roles.Admin,roles.Client],
  Delete : [roles.Artist]
};