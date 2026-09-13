import { prisma } from "../../lib/prisma";
import bcrypt from 'bcryptjs';
import config from '../../config';
import { UserPayload } from "./user.interface";

const registerIntoDB = async (payload: UserPayload) => {

    const { name, email, password, profilePhoto } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (isUserExist) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcryptSaltRounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            // profile: {
            //     create: {
            //         profilePhoto,
            //     },
            // },
        },
    });

    await prisma.profile.create({
        data: {
            userId: createdUser.id,
            profilePhoto,
        },
    });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email,
        },
        omit: {
            password: true,
        },
        include: {
            profile: true,
        }
    });

    return user;
}

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        omit: {
            password: true,
        },
        include: {
            profile: true,
        }
    });
    return user;
}

const updateMyProfileInDB = async (userId: string, payload: any) => {
    const {name, email, profilePhoto, bio} = payload;

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            name,
            email,
            profile: {
                update: {
                    profilePhoto,
                    bio,
                },
            },
        },
        omit: {
            password: true,
        },
        include: {
            profile: true,
        }
    });
    return user;
}

export const userService = {
    registerIntoDB,
    getMyProfileFromDB,
    updateMyProfileInDB
}