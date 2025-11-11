import { validationResult } from "express-validator";
import Item from "../models/itemModel.js";
import Category from "../models/categoryModel.js";

export const createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      name,
      description,
      category,
      type,
      listingDuration,
      durationInDays,
    } = req.body;

    listingDuration = new Date();
    listingDuration.setDate(
      listingDuration.getDate() + (parseInt(durationInDays) || 14)
    );

    const newItem = new Item({
      name,
      description,
      category,
      condition,
      type,
      location: req.user.location,
      owner: req.user._id,
      listingDuration,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(201).json({ message: error.message });
  }
};

export const getItems = async (req, res, next) => {
  try {
    const { id, category, owner, type, search, page, limit, sortBy } =
      req.query;

    if (id) {
      const item = await Item.findById(id);
      if (!item) {
        const error = new Error("Item not found");
        error.statusCode = 404;
        return next(error);
      }
      return res.json(item);
    }

    const filter = {};

    // Fix category filter
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id; // use ObjectId
      } else {
        // No items will match an invalid category
        filter.category = null;
      }
    }

    if (owner) filter.owner = owner;
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    let sortOption = {};
    if (sortBy === "latest") sortOption = { createdAt: -1 };
    else if (sortBy === "oldest") sortOption = { createdAt: 1 };

    const items = await Item.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .populate("owner", "name username"); // populate owner info if needed

    const totalItems = await Item.countDocuments(filter);
    res.json({
      page: pageNumber,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      items,
    });
  } catch (err) {
    next(err);
  }
};
