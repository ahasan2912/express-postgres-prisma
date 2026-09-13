import { Response } from "express";
import { TResponseData } from "../types/type";

export const sendResponse = <T>(res: Response, data:TResponseData<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        total: data.total,
        data: data.data,
        meta: data.meta,
    });
}