import User from '../models/userSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;


        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role: role || 'employee',
            managerId: "54321"
        });

        await newUser.save();

        res.status(201).json({
            msg: "Employee registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({ "msg": "internal error", "error": error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. User ko email se find karein
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials (Email not found)" });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials (Wrong Password)" });
        }


        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token 1 din tak valid rahega
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // dev me false
        });
        // 4. Send Response
        res.status(200).json({
            "msg": "Login Successfully",
            role: user.role,
        });

    } catch (error) {
        res.status(500).json({ "msg": "internal error", "error": error.message });
    }
};

export { login, register }