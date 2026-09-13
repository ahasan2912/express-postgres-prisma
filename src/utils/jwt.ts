import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";


const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions) => {
    const token = jwt.sign(payload, secret, expiresIn);
    return token;
}

const verifyToken = async (token: string, secret: string) => {
    try {
        // decoded token will be of type JwtPayload
        const verifiedToken = jwt.verify(token, secret) as JwtPayload;
        return {
            success: true,
            data: verifiedToken,
        }
    } catch (error: any) {
        console.log("Token verification failed:", error);
        return {
            success: false,
            error: {
                message: error.message
            }
        }
    }
}

export const jwtUtils = {
    createToken,
    verifyToken
}