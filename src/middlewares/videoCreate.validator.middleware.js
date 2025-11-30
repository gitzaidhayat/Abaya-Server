const { body, validationResult } = require("express-validator");

// Validation chains for cloth creation
const videoValidationRules = [
  body("title")
    .notEmpty()
    .withMessage("Cloth title is required")
    .isString()
    .withMessage("Cloth title must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Cloth title must be between 2 and 100 characters")
    .trim(),
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format")
    .trim(),
  body("productName")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string")
    .trim(),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than 0"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .trim(),
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  body().custom((_, { req }) => {
    if (!req.file) {
      throw new Error("Cloth image is required");
    }
    if (req.file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      throw new Error("Only image files are allowed");
    }
    return true;
  }),
];

// Error handler middleware
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
}

module.exports = {
  videoValidationRules,
  validateRequest,
};
