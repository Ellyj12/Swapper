import mongoose from "mongoose";
import dotenv from "dotenv";
import faker from "faker";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import Category from "./models/categoryModel.js";
import Item from "./models/itemModel.js";

dotenv.config();

// ---------------------
// Connect to MongoDB
// ---------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// ---------------------
// Seed Users
// ---------------------
const seedUsers = async (numUsers = 10) => {
  await User.deleteMany();

  const users = [];

  for (let i = 0; i < numUsers; i++) {
    const password = await bcrypt.hash("Password123!", 10);
    users.push({
      name: faker.name.findName(),
      username: faker.internet.userName() + i,
      email: faker.internet.email(),
      password,
      location: faker.address.city(),
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`Seeded ${createdUsers.length} users`);
  return createdUsers;
};

// ---------------------
// Seed Items
// ---------------------
const seedItems = async (users, numItems = 50) => {
  const categories = await Category.find(); // Use existing categories
  if (!categories.length) {
    console.log("No categories found. Please create categories first.");
    return;
  }

  await Item.deleteMany();

  const conditions = ["New", "Like New ", "Used", "Damaged"];
  const types = ["Trade", "Free"];
  const items = [];

  for (let i = 0; i < numItems; i++) {
    const owner = users[Math.floor(Math.random() * users.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    const lat = parseFloat(faker.address.latitude());
    const lng = parseFloat(faker.address.longitude());

    const images = [
      faker.image.imageUrl(),
      faker.image.imageUrl(),
      faker.image.imageUrl(),
    ];

    items.push({
      owner: owner._id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      images,
      condition,
      category: category._id,
      type,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      listingDuration: new Date(
        Date.now() + Math.floor(Math.random() * 30 + 1) * 24 * 60 * 60 * 1000
      ),
    });
  }

  const createdItems = await Item.insertMany(items);
  console.log(`Seeded ${createdItems.length} items`);
};

// ---------------------
// Run Seeder
// ---------------------
const seedDatabase = async () => {
  await connectDB();
  const users = await seedUsers(10);
  await seedItems(users, 100);
  console.log("Database seeding complete");
  process.exit();
};

seedDatabase();
