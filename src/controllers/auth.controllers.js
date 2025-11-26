const userModel = require("../models/user.model")
const adminModel = require("../models/admin.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {

    const { fullName, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists"
        })
    }

    // Don't hash manually - the model's pre-save hook will do it
    const user = await userModel.create({
        fullName,
        email,
        password,
        confirmPassword: password
    })

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to false for localhost
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    })

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role || 'user'
        }
    })

}


async function loginUser(req, res) {
    const { email, password } = req.body;
    
    // Select password explicitly since it's set to select: false in model
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }
    
    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    })

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            email: user.email,  
            fullName: user.fullName,
            role: user.role || 'user'
        }
    })

}


function logoutUser(req, res) {
    res.clearCookie("token")
    res.status(200).json({
        message: "User logged out successfully"
    })
}


async function registerAdmin(req, res) {

    const { 
        fullName,
        email,
        password,
        phone,
        username
    } = req.body;

    const isAdminAlreadyExists = await adminModel.findOne({
        email
    })

    if (isAdminAlreadyExists){
        return res.status(400).json({
            message: "Admin already exists"
        })
    }

    // Don't hash manually - the model's pre-save hook will do it
    const admin = await adminModel.create({
        fullName,
        email,
        password,
        confirmPassword: password,
        phone,
        username,
        role: 'admin'  // Explicitly set role to admin
    })

    const token = jwt.sign({
        id: admin._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    })

    res.status(201).json({
        message: "Admin registered successfully",
        admin: {
            _id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            phone: admin.phone,
            role: 'admin'
        }
    })
    
}


async function loginAdmin (req, res) {
    const {email, password} = req.body;

    // Select password explicitly since it's set to select: false in model
    const admin = await adminModel.findOne({
        email
    }).select('+password')

    if(!admin){
        return res.status(400).json({ 
            message: "Admin does not exist"
    })}

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if(!isPasswordCorrect){
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }
    
    const token = jwt.sign({
        id: admin._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    })

    res.status(200).json({
        message: "Admin logged in successfully",
        admin: {
            _id: admin._id,   
            email: admin.email,
            fullName: admin.fullName,
            role: 'admin'
        }
    })
}


function logoutAdmin(req, res){
    res.clearCookie("token")
    res.status(200).json ({
        message:"Admin Logged Out Successfully"
    })
}






module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerAdmin,
    loginAdmin,
    logoutAdmin
}