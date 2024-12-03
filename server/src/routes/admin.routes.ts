import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  updateAccessToken,
  updateUserInfo,
  updateUserRole,
  changePassword,
  getAllActiveMembers,
} from "../controllers/admin.controller";
import { isAuthenticated, validateRole } from "../middlewares/auth";
const router = express.Router();
router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/refresh", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.put(
  "/update-user-role",
  isAuthenticated,
  validateRole("admin"),
  updateUserRole
);
router.put("/update-info", isAuthenticated, updateUserInfo);
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  validateRole("admin"),
  deleteUser
);
router.get(
  "/get-all-users",
  isAuthenticated,
  validateRole("admin"),
  getAllUsers
);

router.put("/change-password", isAuthenticated, changePassword);
router.get("/get-all-active-members", isAuthenticated,validateRole("admin"), getAllActiveMembers);
export default router;
