const Category = require("../models/category");

// create category
const addCategory = async (req, res) => {
    try {
        const { categoryName, categoryDescription } = req.body;
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({success: false, message: "Category already exists" });
        }
        const newCategory = new Category({
            categoryName,
            categoryDescription,
        });
        const savedCategory = await newCategory.save();
        res.status(200).json({success: true, message: "Category created successfully", category: savedCategory});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Server Error" });
    }
};

const getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit== 'all'? null : parseInt(req.query.limit) || 5;
        const categories = await Category.find().skip((page - 1) * limit).limit(limit);
        const totalPages = Math.ceil(await Category.countDocuments() / limit) ;
        res.status(200).json({success: true, categories, totalPages});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Server Error" });
    }
};

const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({success: false, message: "Category not found" });
        }
        category.isActive = action === "block" ? false : true;
        await category.save();
        res.status(200).json({success: true, message: "Category status updated successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Server Error" });
    }
};

const updateCategory = async (req,res) => {
    try {
        const { id } = req.params;
        const updatedCategory = req.body;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        const existingCategory = await Category.findOne({ categoryName: updatedCategory.categoryName });
        if (existingCategory && existingCategory._id.toString() !== id) {
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }
        category.categoryName = updatedCategory.categoryName;
        category.categoryDescription = updatedCategory.categoryDescription;
        await category.save();
        return res.status(200).json({ success: true, message: "Category updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
module.exports = {
    addCategory,
    getCategories,
    updateCategoryStatus,
    updateCategory
};