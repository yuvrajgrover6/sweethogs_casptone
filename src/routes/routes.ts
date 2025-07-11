import {
  createNewHomeController,
  getHomeController,
  listHomesController,
  updateHomeController,
  deleteHomeController,
} from "../controllers/home_controller";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  logoutAllController,
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "../controllers/auth_controller";
import { authenticateToken } from "../middleware/authMiddleware";

export const routesConfig = [
  {
    base: "/auth",
    paths: [
      {
        path: "/register",
        method: "POST",
        handler: registerController,
      },
      {
        path: "/login",
        method: "POST",
        handler: loginController,
      },
      {
        path: "/refresh",
        method: "POST",
        handler: refreshTokenController,
      },
      {
        path: "/logout",
        method: "POST",
        handler: logoutController,
      },
      {
        path: "/logout-all",
        method: "POST",
        handler: [authenticateToken, logoutAllController],
      },
      {
        path: "/profile",
        method: "GET",
        handler: [authenticateToken, getProfileController],
      },
      {
        path: "/profile",
        method: "PUT",
        handler: [authenticateToken, updateProfileController],
      },
      {
        path: "/change-password",
        method: "POST",
        handler: [authenticateToken, changePasswordController],
      },
    ],
  },
  {
    base: "/home",
    paths: [
      {
        path: "/",
        method: "POST",
        handler: createNewHomeController,
      },
      {
        path: "/",
        method: "GET",
        handler: listHomesController,
      },
      {
        path: "/:id",
        method: "GET",
        handler: getHomeController,
      },
      {
        path: "/:id",
        method: "PUT",
        handler: updateHomeController,
      },
      {
        path: "/:id",
        method: "DELETE",
        handler: deleteHomeController,
      },
    ],
  },
];
