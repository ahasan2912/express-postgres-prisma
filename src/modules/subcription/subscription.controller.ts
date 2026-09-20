import { NextFunction, Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const CreateCheckout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await subscriptionService.createCheckOutIntoDB(userId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Checkout created successfully",
            data: result
        });
    }
);

const handleWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const event = req.body as Buffer;
        const signature = req.headers['stripe-signature'] as string;

        await subscriptionService.handleWebhook(event, signature as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Webhook handled successfully",
            data: null
        });
    }
);

const getSubscriptionStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await subscriptionService.getSubscriptionStatusIntoDB(userId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Subscription status retrieved successfully",
            data: result
        });
    }
);

export const subscriptionController = {
    CreateCheckout,
    handleWebhook,
    getSubscriptionStatus
};