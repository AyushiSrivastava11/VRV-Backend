import express from "express";
import { validateRole, isAuthenticated } from "../middlewares/auth";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getCategory,
  getMenuItem,
  updateCategory,
  updateMenuItem,
} from "../controllers/menu.controller";
const router = express.Router();

router.post(
  "/create-category",
  isAuthenticated,
  validateRole("admin"),
  createCategory
);
router.patch(
  "/update-category/:id",
  isAuthenticated,
  validateRole("admin"),
  updateCategory
);
router.delete(
  "/delete-category/:id",
  isAuthenticated,
  validateRole("admin"),
  deleteCategory
);
router.get("/get-categories", getCategory);

router.post(
  "/create-menuItem",
  isAuthenticated,
  validateRole("admin"),
  createMenuItem
);
router.patch(
  "/update-menuItem/:id",
  isAuthenticated,
  validateRole("admin"),
  updateMenuItem
);
router.delete(
  "/delete-menuItem/:id",
  isAuthenticated,
  validateRole("admin"),
  deleteMenuItem
);
router.get("/get-menuItems", getMenuItem);

export default router;