import jwt from "jsonwebtoken";
import { errorResponse } from "../helpers/response.helper.js";
import { env } from '../config/env.js';

const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        // console.log(authorization)
        if (!authorization) {
            return errorResponse(
                res,
                "Token requerido",
                401,
            );
        }
        const token = authorization.replace(
            "Bearer ",
            "",
        );
        // console.log(token)
        const decoded = jwt.verify(
            token,
            env.JWT_SECRET,
        );
        // console.log(decoded)
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    } catch (error) {
        errorResponse(
            res,
            "Token inválido",
            401,
        );
    }
};

export { authMiddleware };