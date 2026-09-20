import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { SubscriptionStatus } from "../../generated/prisma/client";

export const subscriptionGaurd = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId: userId as string,
            },
        });

        if (!subscription) {
            throw new Error("Please subscribe to access premium contents");
        }

        if (subscription?.status !== SubscriptionStatus.ACTIVE) {
            throw new Error("Please subscribe again to access premium contents");
        }

        next();
    }
)