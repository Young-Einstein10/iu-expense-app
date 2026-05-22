import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { authenticateToken } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validation";
import {
  createCategorySchema,
  updateCategorySchema,
  uuidParamsSchema,
} from "../utils/validation";

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

// GET /api/v1/categories/stats - Get category statistics
router.get("/stats", categoryController.getCategoryStats);

// POST /api/v1/categories/default - Create default categories
router.post("/default", categoryController.createDefaultCategories);

// GET /api/v1/categories - Get all categories
router.get("/", categoryController.getCategories);

// POST /api/v1/categories - Create a new category
router.post(
  "/",
  validateBody(createCategorySchema),
  categoryController.createCategory,
);

// GET /api/v1/categories/:id - Get a specific category
router.get(
  "/:id",
  validateParams(uuidParamsSchema),
  categoryController.getCategoryById,
);

// PUT /api/v1/categories/:id - Update a category
router.put(
  "/:id",
  validateParams(uuidParamsSchema),
  validateBody(updateCategorySchema),
  categoryController.updateCategory,
);

// DELETE /api/v1/categories/:id - Delete a category
router.delete(
  "/:id",
  validateParams(uuidParamsSchema),
  categoryController.deleteCategory,
);

export default router;
