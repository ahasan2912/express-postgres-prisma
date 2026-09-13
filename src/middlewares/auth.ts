import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// for decoded type of jwt token, we can extend the Request interface to include a user property with the desired type. This way, we can access the user information in our route handlers without having to cast the request object every time.
declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ?
         req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;

        if (!token) {
            throw new Error("You are not authorized to access this resource");
        }

        const verifiedToken = await jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error?.message || "Token verification failed");
        }

        const { email, name, id, role } = verifiedToken.data as JwtPayload;
        req.user = { email, name, id, role };

        if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
            throw new Error("You do not have permission to access this resource");
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
                email,
                name,
                role,
            },
        });

        if (!user) {
            throw new Error("User not found, Please login again");
        }

        if (user.activeStatus === "BLOCKED") {
            throw new Error("Your account has been blocked, Please contact support");
        }

        req.user = { email, name, id, role: role as Role };

        next();
    });
}