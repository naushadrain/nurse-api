const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = 'naus@12hb%^&';
/**
 * @desc Register User (email or phone)
 * @route POST /api/auth/register
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, role } = req.body;

        // 1️⃣ Validate required fields
        if (!name || !password || !confirmPassword || !role) {
            return res.status(400).json({ message: "Name, password, confirmPassword, and role are required" });
        }

        // 2️⃣ At least one of email or phone must be provided
        if (!email && !phone) {
            return res.status(400).json({ message: "Either email or phone number is required" });
        }

        // 3️⃣ Validate role
        if (!["nurse", "physio"].includes(role)) {
            return res.status(400).json({ message: "Role must be either nurse or physio" });
        }

        // 4️⃣ Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // 5️⃣ Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email or phone already exists" });
        }

        // 6️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7️⃣ Create new user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        });

        // 8️⃣ Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("❌ Register Error:", error.message);
        res.status(500).json({
            message: "Server error during registration",
            error: error.message,
        });
    }
};


/**
 * @desc Login User (email or phone)
 * @route POST /api/auth/login
 */
const loginUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // 1️⃣ Require password and at least email or phone
        if (!password || (!email && !phone)) {
            return res.status(400).json({ message: "Password and either email or phone are required" });
        }

        // 2️⃣ Find user by email OR phone
        const user = await User.findOne({
            $or: [{ email }, { phone }],
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        // 3️⃣ Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "password is incorrect" });
        }

        // 4️⃣ Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({
            message: "Server error during login",
            error: error.message,
        });
    }
};

/**
 * @desc Logout User
 * @route POST /api/auth/logout
 * Note: With JWT, logout is typically handled on the client side by deleting the token.
 */
const logoutUser = (req, res) => {
    // Clear the token from the client side
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful. Token has been cleared on client side." });
}


module.exports = { registerUser, loginUser, logoutUser };