import { catchAsync } from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { Menu, Category } from "../models/menu.model";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const existingCategory = await Category.findOne({
        name,
      });
      if (existingCategory) {
        return next(new ErrorHandler("Category already exists", 400));
      }
      const newCategory = new Category({
        name,
      });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return next(new ErrorHandler("Category already exists", 400));
      }
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );

      if (!updatedCategory) {
        return next(new ErrorHandler("Category not found", 404));
      }
      res.status(200).json(updatedCategory);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) return next(new ErrorHandler("Category not found", 404));
      await category.deleteOne({ id });
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const createMenuItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        description,
        price,
        categoryId,
        type,
        size,
        availability,
      } = req.body;
      const newMenuItem = new Menu({
        name,
        description,
        price,
        categoryId,
        type,
        size,
        availability,
      });
      await newMenuItem.save();
      res.status(201).json(newMenuItem);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const updateMenuItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        categoryId,
        type,
        size,
        availability,
      } = req.body;
      const updatedMenuItem = await Menu.findByIdAndUpdate(
        id,
        { name, description, price, categoryId, type, size, availability },
        { new: true }
      );
      if (!updatedMenuItem) {
        return next(new ErrorHandler("Menu item not found", 404));
      }
      res.status(200).json(updatedMenuItem);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const deleteMenuItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const menuItem = await Menu.findById(id);
      if (!menuItem) return next(new ErrorHandler("Menu item not found", 404));
      await menuItem.deleteOne({ id });
      res.status(200).json({
        success: true,
        message: "Menu item deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const getMenuItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menuItems = await Menu.find();
      res.status(200).json(menuItems);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
