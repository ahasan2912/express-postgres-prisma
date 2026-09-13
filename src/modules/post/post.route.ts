import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";
import { postController } from "./post.controller";

const router = Router();

router.post("/", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postController.createPost);

router.get("/", postController.getAllPosts);

router.get("/my-posts", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postController.getMyPosts);

router.get("/stats", postController.getPostStatus);

router.get("/:id", postController.getPostById);
router.patch("/:id", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postController.updatePost);

router.delete("/:id", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postController.deletePost);


export const postsRouter = router;