import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IPostQuery, IUpdatePayload } from "./post.interface"

const createPostIntoDB = async (payload: ICreatePostPayload, userId: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        include: {
            subscriptions: true
        }
    });

    if(payload.isPeremium && user.subscriptions?.status !== "ACTIVE") {
        throw new Error("You are not subscribed to create premium post");
    }

    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })
    return result;
}

const getAllPostsFromDB = async (query: IPostQuery) => {
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
        isPeremium: false
    })

    const result = await prisma.post.findMany({

        //pagination
        where: {
            AND: andCondition
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
        data: result,
        meta: {
            page: page,
            limit: limit,
            total: totalPostCount,
            totalPages: Math.ceil(totalPostCount / limit)
        }
    };
}

const getPostByIdFromDB = async (postId: string) => {
    // transaction and RoleBack
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId,
                    isPeremium: false
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            });

            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId
                },
                include: {
                    author: {
                        omit: {
                            password: true,
                        }
                    },
                    comments: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });

            return post;
        }
    );

    return transactionResult;
}

const getMyPostsFromDB = async (authorId: string) => {
    const result = await prisma.post.findMany({
        where: {
            authorId: authorId
        },

        orderBy: {
            createdAt: "desc"
        },
        include: {
            comments: true,
            author: {
                omit: {
                    password: true,
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    return result;
}

const updatePostIntoDB = async (postId: string, payload: IUpdatePayload, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not authorized to update this post");
    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true,
                }
            },
            comments: true,
        }
    });

    return result;
}

const deletePostFromDB = async (postId: string, authorId: string, isAdmin: boolean) => {

    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not owner of this post");
    }

    await prisma.post.delete({
        where: {
            id: postId
        }
    });
}

const getPostStatusFromDB = async () => {

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            const [
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViewsAggregate
            ] = await Promise.all([
                await tx.post.count(),
                await tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                await tx.comment.count(),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.REJECTED
                    }
                }),
                await tx.post.aggregate({
                    _sum: {
                        views: true
                    }
                })
            ]);


            return {
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViews: totalPostViewsAggregate._sum.views
            }
        }
    );

    return transactionResult;
}

export const postService = {
    createPostIntoDB,
    getAllPostsFromDB,
    getPostByIdFromDB,
    getMyPostsFromDB,
    updatePostIntoDB,
    deletePostFromDB,
    getPostStatusFromDB
}