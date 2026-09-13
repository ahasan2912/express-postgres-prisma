import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPost = catchAsync(async (req: Request, res: Response) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPostIntoDB(payload, id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Post created successfully",
        data: result,
    });

});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    console.log("query", query);
    const result = await postService.getAllPostsFromDB(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Posts fetched successfully",
        total: result.length,
        data: result,
    });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.user?.id;
    const result = await postService.getMyPostsFromDB(authorId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My posts fetched successfully",
        data: result,
    });
});

const getPostStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await postService.getPostStatusFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post status fetched successfully",
        data: result,
    });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const result = await postService.getPostByIdFromDB(postId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post fetched successfully",
        data: result,
    });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!postId) {
        throw new Error("Post ID is required");
    }

    const payload = req.body;
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.updatePostIntoDB(postId as string, payload, authorId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post updated successfully",
        data: result,
    });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!postId) {
        throw new Error("Post ID is required");
    }

    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePostFromDB(postId as string, authorId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post deleted successfully",
        data: null,
    });
});

export const postController = {
    createPost,
    getAllPosts,
    getPostStatus,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost
}