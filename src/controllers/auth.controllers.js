const userModel = require("../models/user.model");
const clothPartnerModel = require("../models/clothpartner.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkLoginAttempts, recordFailedAttempt, resetLoginAttempts } = require('../middlewares/auth.middleware');

async function registerUser(req, res) {

    const { fullName, username, email, phone, password } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
        return res.status(400).json({
            message: "Full name, email, and password are required"
        });
    }

    // Normalize email and username to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username ? username.toLowerCase().trim().replace(/\s+/g, '_') : undefined;

    // Check if user already exists by email, username, or phone
    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { email: normalizedEmail },
            ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
            ...(phone ? [{ phone }] : [])
        ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists with this email, username, or phone"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        phone,
        password: hashedPassword
    })

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    })

    // Set secure HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            fullName: user.fullName
        }
    })

}


async function loginUser(req, res) {
    try {
        // Handle undefined req.body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                message: "Invalid request. Please send JSON data with Content-Type: application/json"
            });
        }
        
        // Support both 'identifier' and 'email' field names
        const { identifier, email, username, password } = req.body;
        const loginIdentifier = identifier || email || username;
        
        // Validate required fields
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                message: "Email/Username and password are required"
            });
        }
        
        // Ensure loginIdentifier is a string
        if (typeof loginIdentifier !== 'string') {
            return res.status(400).json({
                message: "Invalid identifier format"
            });
        }
        
        const ip = req.ip || req.connection.remoteAddress;
        
        // Normalize identifier to lowercase and convert spaces to underscores
        const normalizedIdentifier = loginIdentifier.toLowerCase().trim().replace(/\s+/g, '_');
        
        // Check for rate limiting
        try {
            checkLoginAttempts(normalizedIdentifier, ip);
        } catch (error) {
            return res.status(429).json({
                message: error.message
            });
        }
        
        // Find user by email, username, or phone
        const user = await userModel.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier },
                { phone: loginIdentifier }
                
            ]
        })

        if (!user) {
            recordFailedAttempt(normalizedIdentifier, ip);
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            recordFailedAttempt(normalizedIdentifier, ip);
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
        
        // Reset login attempts on successful login
        resetLoginAttempts(normalizedIdentifier, ip);
        
        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })
        
        // Set secure HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Socket.IO: Notify that user is online
        const io = req.app.get('io');
        if (io) {
            io.emit('user-online', {
                userId: user._id,
                fullName: user.fullName,
                timestamp: new Date()
            });
        }

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                fullName: user.fullName
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}


function logoutUser(req, res) {
    // Socket.IO: Notify that user went offline
    const io = req.app.get('io');
    if (io && req.user) {
        io.emit('user-offline', {
            userId: req.user.id,
            timestamp: new Date()
        });
    }

    res.clearCookie("token")
    res.status(200).json({
        message: "User logged out successfully"
    })
}


// Cloth Partner Controllers
async function registerClothPartner(req, res) {
    const { fullName, username, email, phone, password, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !confirmPassword) {
        return res.status(400).json({
            message: "Full name, email, password and confirm password are required"
        });
    }

    // Confirm password match
    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Passwords do not match"
        });
    }

    // Basic password strength check (optional)
    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    // Normalize email and username to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username ? username.toLowerCase().trim().replace(/\s+/g, '_') : undefined;

    // Check if partner already exists
    const isPartnerExists = await clothPartnerModel.findOne({
        $or: [
            { email: normalizedEmail },
            ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
            ...(phone ? [{ phone }] : [])
        ]
    })

    if (isPartnerExists) {
        return res.status(400).json({
            message: "Partner already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await clothPartnerModel.create({
        fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: 'clothPartner' // Add role field
    })

    const token = jwt.sign({
        id: partner._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: "Cloth partner registered successfully",
        partner: {
            _id: partner._id,
            email: partner.email,
            username: partner.username,
            phone: partner.phone,
            fullName: partner.fullName,
            role: partner.role
        }
    })
}

async function loginClothPartner(req, res) {
    try {
        // Handle undefined req.body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                message: "Invalid request. Please send JSON data with Content-Type: application/json"
            });
        }
        
        // Support both 'identifier' and 'email' field names
        const { identifier, email, username, password } = req.body;
        const loginIdentifier = identifier || email || username;
        
        // Validate required fields
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                message: "Email/Username and password are required"
            });
        }
        
        // Ensure loginIdentifier is a string
        if (typeof loginIdentifier !== 'string') {
            return res.status(400).json({
                message: "Invalid identifier format"
            });
        }
        
        const ip = req.ip || req.connection.remoteAddress;

        // Normalize identifier to lowercase and convert spaces to underscores
        const normalizedIdentifier = loginIdentifier.toLowerCase().trim().replace(/\s+/g, '_');

        try {
            checkLoginAttempts(normalizedIdentifier, ip);
        } catch (error) {
            return res.status(429).json({
                message: error.message
            });
        }

        const partner = await clothPartnerModel.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier },
                { phone: loginIdentifier }
            ]
        })

        if (!partner) {
            recordFailedAttempt(normalizedIdentifier, ip);
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, partner.password);

        if (!isPasswordCorrect) {
            recordFailedAttempt(normalizedIdentifier, ip);
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        resetLoginAttempts(normalizedIdentifier, ip);

        const token = jwt.sign({
            id: partner._id,
        }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const io = req.app.get('io');
        if (io) {
            io.emit('partner-online', {
                partnerId: partner._id,
                fullName: partner.fullName,
                timestamp: new Date()
            });
        }

        res.status(200).json({
            message: "Cloth partner logged in successfully",
            partner: {
                _id: partner._id,
                email: partner.email,
                username: partner.username,
                phone: partner.phone,
                fullName: partner.fullName,
                role: partner.role
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

function logoutClothPartner(req, res) {
    const io = req.app.get('io');
    if (io && req.clothPartner) {
        io.emit('partner-offline', {
            partnerId: req.clothPartner.id,
            timestamp: new Date()
        });
    }

    res.clearCookie("token")
    res.status(200).json({
        message: "Cloth partner logged out successfully"
    })
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerClothPartner,
    loginClothPartner,
    logoutClothPartner
}