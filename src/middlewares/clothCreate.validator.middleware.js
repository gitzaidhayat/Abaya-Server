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
        .isLength({ min: 10, max: 500 }).withMessage('Cloth description must be between 10 and 500 characters')
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