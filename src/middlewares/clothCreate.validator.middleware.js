const { body, validationResult } = require('express-validator');

// Validation chains for cloth creation
const clothValidationRules = [
    body('name')
        .notEmpty().withMessage('Cloth name is required')
        .isString().withMessage('Cloth name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Cloth name must be between 2 and 100 characters')
        .trim(),
    body('description')
        .notEmpty().withMessage('Cloth description is required')
        .isString().withMessage('Cloth description must be a string')
        .isLength({ min: 10, max: 2000 }).withMessage('Cloth description must be between 10 and 2000 characters')
        .trim(),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('size')
        .notEmpty().withMessage('Size is required')
        .isString().withMessage('Size must be a string')
        .trim(),
    body('color')
        .notEmpty().withMessage('Color is required')
        .isString().withMessage('Color must be a string')
        .trim(),
    body().custom((_, { req }) => {
        if (!req.file) {
            throw new Error('Cloth image is required');
        }
        if (req.file.size > 10 * 1024 * 1024) {
            throw new Error('File size must be less than 10MB');
        }
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ];
        if (!allowedMimes.includes(req.file.mimetype)) {
            throw new Error('Only image files are allowed');
        }
        return true;
    })
];

// Error handler middleware
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}

module.exports = {
    clothValidationRules,
    validateRequest
}