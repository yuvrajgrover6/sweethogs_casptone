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
import {
  predictReadmissionController,
  predictBatchReadmissionController,
  getModelInfoController,
  testPredictionController,
} from "../controllers/readmission_controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validation";
import {
  readmissionPredictionSchema,
  batchReadmissionPredictionSchema,
} from "../utils/validation_schemas";

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
  {
    base: "/readmission",
    paths: [
      {
        path: "/predict",
        method: "POST",
        handler: predictReadmissionController,
        middleware: [
          authenticateToken,
          validateRequest(readmissionPredictionSchema),
        ],
      },
      {
        path: "/predict/batch",
        method: "POST",
        handler: predictBatchReadmissionController,
        middleware: [
          authenticateToken,
          validateRequest(batchReadmissionPredictionSchema),
        ],
      },
      {
        path: "/model-info",
        method: "GET",
        handler: getModelInfoController,
        middleware: [authenticateToken],
      },
      {
        path: "/test",
        method: "GET",
        handler: testPredictionController,
      },
    ],
  },
];
