import express from 'express';
const router = express.Router();
import { protect } from '../middlewear/authMiddlewear.js';
import { validateItem } from '../middlewear/validation/itemValidation.js';
import { createItem, getItems } from '../controllers/itemController.js';



router.get("/", getItems);
router.post('/create',protect,validateItem,createItem);

export default router