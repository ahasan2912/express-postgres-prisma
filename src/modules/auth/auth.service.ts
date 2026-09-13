import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { LoadingPayload } from "./auth.interface";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginIntoDB = async (payload: LoadingPayload) => {
    const { email, password } = payload;

    // const user = await prisma.user.findUnique({
    //     where: {
    //         email,
    //     },
    // });

    // if(!user) {
    //     throw new Error("Invalid email or password");
    // }

    const user = await prisma.user.findUniqueOrThrow({
        where: { email },
    });

    if (user.activeStatus === "BLOCKED") {
        throw new Error("Your account has been blocked, Please contact support");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    // access-token and refresh-token generation logic will be here
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, {
        expiresIn: config.jwt_access_expiration
    } as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, {
        expiresIn: config.jwt_refresh_expiration
    } as SignOptions,
    );

    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken, refreshToken };
}

const refreshToken = async (token: string) => {
    const verifiedToken = await jwtUtils.verifyToken(token, config.jwt_refresh_secret);

    if(!verifiedToken.success) {
        throw new Error(verifiedToken.error?.message);
    }

    const {id} = verifiedToken.data as {id: string};

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, {
        expiresIn: config.jwt_access_expiration
    } as SignOptions);

    return { accessToken: accessToken };
}

export const authService = {
    loginIntoDB,
    refreshToken,
}