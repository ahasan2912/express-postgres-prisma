import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    /* const sortBy = query.sortBy ? query.sortBy : { createdAt: "desc" };
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"; */

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const tags = query.tags ? JSON.parse(query.tags as string) : null;
    const tagsArrray = Array.isArray(tags) ? tags : [];

    const andCondition: PostWhereInput[] = [];

    if (query.searchTerm) {
        andCondition.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    if (query.title) {
        andCondition.push({
            title: query.title
        })
    }

    if (query.content) {
        andCondition.push({
            content: query.content
        })
    }

    if (query.authorId) {
        andCondition.push({
            authorId: query.authorId
        })
    }

    if (query.isFeatured) {
        andCondition.push({
            isFeatured: query.isFeatured
        })
    }

    if (query.tags) {
        andCondition.push({
            tags: {
                hasSome: tagsArrray
            }
        })
    }

    if (query.status) {
        andCondition.push({
            status: query.status
        })
    }

    andCondition.push({
        isPeremium: true
    })

    const posts = await prisma.post.findMany({
        where: {
            isPeremium: true,
        },
        take: limit,
        skip: skip,

        //sortBy 
        orderBy: {
            [sortBy as string]: sortOrder,
        },

        include: {
            author: {
                omit: {
                    password: true,
                }
            },
            comments: true,
        }
    });

    const totalPostCount = await prisma.post.count({
        where: {
            AND: andCondition
        }
    });

    return {
        data: posts,
        meta: {
            page: page,
            limit: limit,
            total: totalPostCount,
            totalPages: Math.ceil(totalPostCount / limit)
        }
    };
}

export const premiumService = {
    getPremiumContent
};