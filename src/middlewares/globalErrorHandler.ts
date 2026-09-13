import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("Error: ", err);

    let statusCode;
    let errorMessage = err.message || "Internal Server Error";
    let errorName = err.name || "Internal Server Error";

    if(err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "You have provided incorrect filed type of missing required fields."
    } else if(err instanceof Prisma.PrismaClientKnownRequestError) {
        if(err.code === "P2002") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Duplicate field value entered.";
        } else if(err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Foreign key constraint failed.";
        } else if (err.code === "P2025") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "An Operaton failed because it depends on one or more records that were required but not found.";
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = "Prisma Client failed to initialize.";
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        sucess: false,
        statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        name: errorName,
        message: errorMessage,
        error: err.stack,
    })
}