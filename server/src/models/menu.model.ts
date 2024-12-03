import mongoose, { Document, Schema, Model } from "mongoose";

// Define interfaces for the schemas
export interface ICategory extends Document {
    name: string;
}

export interface IMenu extends Document {
    name: string;
    description: string;
    price: number;
    image?: string; 
    categoryId: mongoose.Types.ObjectId;
    type: string;
    size: string;
    availability: string;
}

// Define the Category Schema
const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
    },
    { timestamps: true }
);

// Define the Menu Schema
const menuSchema = new Schema<IMenu>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: false }, // This field remains optional
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        type: { type: String, required: true },
        size: { type: String, required: true },
        availability: { type: String, required: true },
    },
    { timestamps: true }
);

// Export models
export const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
export const Menu: Model<IMenu> = mongoose.model<IMenu>('Menu', menuSchema);
