import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "../utils/appError.js";
dotenv.config();
const jwtAuthMiddleware = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        throw new AppError("No token!", 401);
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            throw new AppError("Wrong token!", 403);
        }
        req.user = decoded;
        return next();
    });
};
export default jwtAuthMiddleware;
