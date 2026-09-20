import { PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";

export interface ICreatePostPayload {
    title: string;
    content: string;
    thumbnail?: string;
    isFeatured?: boolean;
    isPeremium?: boolean;
    status?: PostStatus;
    tags: string[];
}

export interface IUpdatePayload {
    title?: string;
    content?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    status?: PostStatus;
    tags?: string[];
}

export interface IPostQuery extends PostWhereInput {
    // title?: string;
    // content?: string;
    // tags?: string[];
    searchTerm?: string;
    page?: number;
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}