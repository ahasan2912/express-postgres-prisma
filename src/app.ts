import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.routes";
import { postsRouter } from "./modules/post/post.route";
import { commentRouter } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: config.app_url,
    credentials: true,
}));

app.get("/", async (req: Request, res: Response) => {
    res.send("Welcome to prisma press...");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentRouter);

app.use(notFound);

//error handaling middleware
app.use(globalErrorHandler);

export default app;