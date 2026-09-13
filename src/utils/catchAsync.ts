import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";

// catchAsync is a higher-order function that takes an asynchronous function (fn) as an argument and returns a new function. Here catchAsync return request and response. 
export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            // res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            //     sucess: false,
            //     statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            //     message: "Failed to register user",
            //     error: error.message,
            // });

            next(error);
        }
    }
}