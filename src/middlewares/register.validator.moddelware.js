const { body, validationResult } = require('express-validator');


    const registerRules = [
        body('fullName')
        .notEmpty().withMessage('Full Name is required')
        .isString().withMessage('Full Name must be a string')
        .isLength({ min: 4, max: 50 }).withMessage('Full Name must be between 4 and 50 characters')
        .trim(),
        body('email')
        .trim() // Remove whitespace
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ max: 254 })
        .withMessage('Email is too long (max 254 characters)')
        .custom((value) => {
        // Custom validation for specific email domains
        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
        const domain = value.split('@')[1];
        
        if (!allowedDomains.includes(domain)) {
            throw new Error('Email domain not allowed');
        }
        return true;
        })
        .custom((value) => {
        // Check for temporary/disposable emails
        const disposableDomains = ['10minutemail.com', 'temp-mail.org', 'guerrillamail.com'];
        const domain = value.split('@')[1];
        
        if (disposableDomains.includes(domain)) {
            throw new Error('Temporary email addresses are not allowed');
        }
        return true;
        })
        .normalizeEmail({
        gmail_remove_dots: true,
        gmail_remove_subaddress: true,
        outlookdotcom_remove_subaddress: true,
        yahoo_remove_subaddress: true
        }),
        body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters long')
        .not().isLowercase()
        .withMessage('Password must contain at least one uppercase letter')
        .not().isUppercase()
        .withMessage('Password must contain at least one lowercase letter')
        .not().isAlpha()
        .withMessage('Password must contain at least one number or special character')
        .not().isNumeric()
        .withMessage('Password cannot contain only numbers')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('Password must contain at least one special character')
    ];

  


// Error handler middleware
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            message: 'Validation errors',
            
        });
    }
    next();
}
module.exports = {
    registerRules,
    validateRequest
}

