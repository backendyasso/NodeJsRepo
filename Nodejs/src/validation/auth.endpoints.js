import { roles } from "../middlewares/auth.js";
export const endpoints = {
  addUser: [roles.Admin, roles.Client, roles.Artist],
  community: [roles.Artist],
  Carter: [roles.Client],
  updateProfile: [roles.Artist],
  adminOnly: [roles.Admin],
  addrepo: [roles.Client, roles.Artist],
};
