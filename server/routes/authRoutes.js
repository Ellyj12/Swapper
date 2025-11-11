import express from "express";;
import { createUser, loginUser } from "../controllers/authController.js";
import { validateUser } from "../middlewear/validation/userCreationValidation.js";

const router = express.Router();

router.post("/register", validateUser, createUser);

router.post("/login", loginUser);

export default router;
