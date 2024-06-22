import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "../utils/appError.js";
import * as userModel from "../models/user.js";
import * as projectModel from "../models/project.js";
dotenv.config();
export const getUser = async (req, res) => {
    const { id } = req.query;
    const user = await userModel.getUser(id);
    res.status(200).json(user);
};
export const handleSignup = async (req, res) => {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
        throw new AppError("Name, email and password are required!", 400);
    }
    const existUser = await userModel.checkUserByEmail(email);
    if (existUser) {
        throw new AppError("The email is already signed up!", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = await userModel.createUser(name, email, hashedPassword);
    const jwtResult = jwtTokenGenerator(payload);
    res.status(200).send(jwtResult);
};
export const handleSignin = async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) {
        throw new AppError("Email and password are required!", 400);
    }
    const hashedPassword = await userModel.getUserPasswordByEmail(email);
    bcrypt.compare(password, hashedPassword, async (err, decoded) => {
        if (err) {
            throw new AppError(err.message, 500);
        }
        if (decoded) {
            const existUser = await userModel.checkUserByEmail(email);
            const payload = {
                id: existUser.id,
                name: existUser.name,
                email: existUser.email,
            };
            const jwtResult = jwtTokenGenerator(payload);
            res.status(200).send(jwtResult);
        }
        else {
            throw new AppError("Incorrect email or password", 403);
        }
    });
};
export const getUserProjects = async (req, res) => {
    const { id } = req.user;
    const projects = await projectModel.getProjectsByUserId(id);
    res.status(200).send(projects);
};
export const getUserInfo = async (req, res) => {
    const { id, name, email } = req.user;
    res.status(200).json({ id, name, email });
};
const JWTExpired = 3600;
const jwtTokenGenerator = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: JWTExpired,
    });
    return {
        access_token: token,
        access_expired: JWTExpired,
        user: payload,
    };
};
