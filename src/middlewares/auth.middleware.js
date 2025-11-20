const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const clothPartnerModel = require('../models/clothpartner.model');

// Track login attempts (in production, use Redis)
const loginAttempts = new Map();

// Rate limiting for login attempts
function checkLoginAttempts(identifier, ip) {
    if (!identifier || !ip) {
        return; // Skip rate limiting if values are undefined
    }
    
    const key = `${identifier}-${ip}`;
    const attempts = loginAttempts.get(key) || { count: 0, lockUntil: null };
    
    if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
        throw new Error(`Too many login attempts. Try again in ${remainingTime} minutes`);
    }
    
    if (attempts.lockUntil && attempts.lockUntil <= Date.now()) {
        loginAttempts.delete(key);
        return;
    }
}

function recordFailedAttempt(identifier, ip) {
    if (!identifier || !ip) {
        return; // Skip recording if values are undefined
    }
    
    const key = `${identifier}-${ip}`;
    const attempts = loginAttempts.get(key) || { count: 0, lockUntil: null };
    
    attempts.count++;
    
    if (attempts.count >= 5) {
        attempts.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
    }
    
    loginAttempts.set(key, attempts);
}

function resetLoginAttempts(identifier, ip) {
    if (!identifier || !ip) {
        return; // Skip reset if values are undefined
    }
    
    const key = `${identifier}-${ip}`;
    loginAttempts.delete(key);
}

// User authentication middleware
async function authUserMiddleware(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized Access - No token provided"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized Access - User not found"
            })
        }
        
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Session expired. Please login again"
            })
        }
        return res.status(401).json({
            message: "Unauthorized Access - Invalid token"
        })
    }
}

// Cloth Partner authentication middleware
async function authClothPartnerMiddleware(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized Access - No token provided"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clothPartner = await clothPartnerModel.findById(decoded.id).select('-password');
        
        if (!clothPartner) {
            return res.status(401).json({
                message: "Unauthorized Access - Partner not found"
            })
        }
        
        req.clothPartner = clothPartner;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Session expired. Please login again"
            })
        }
        return res.status(401).json({
            message: "Unauthorized Access - Invalid token"
        })
    }
}

module.exports = {
    authUserMiddleware,
    authClothPartnerMiddleware,
    checkLoginAttempts,
    recordFailedAttempt,
    resetLoginAttempts
} 