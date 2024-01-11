import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { ReactionDto } from './dto/reaction.dto';

@Injectable()
export class ReactionService {
    constructor(private readonly prisma: PrismaService) { }

    async addReaction(reactionData: ReactionDto): Promise<any> {
        try {
            if (reactionData.postId != -1) { // if postId is null, then it means that reaction is on a comment
                    const post = await this.prisma.post.update({
                        where: {
                            id: reactionData.postId,
                        },
                        data: {
                            likes: { increment: 1 },
                        },
                    });
                    const reaction = await this.prisma.reaction.create({
                        data: {
                            postId: reactionData.postId,
                            userId: reactionData.userId,
                            commentId: null,
                        },
                    });
            }
            else {
                const comment = await this.prisma.comment.update({
                    where: {
                        id: reactionData.commentId,
                    },
                    data: {
                        likes: { increment: 1 },
                    },
                });
                const reaction = await this.prisma.reaction.create({
                    data: {
                        commentId: reactionData.commentId,
                        userId: reactionData.userId,
                        postId: null,
                    },
                });
            }
        } catch (error) {
            throw error;
        }
    }
    async checkForExistingReaction(reactionData: ReactionDto): Promise<any> {
        try {
            if (reactionData.postId != -1) { // if postId is null, then it means that reaction is on a comment
                const exists = await this.prisma.reaction.findMany({
                    where: {
                        userId: reactionData.userId,
                        postId: reactionData.postId,
                        commentId: null,
                    },
                });
                return exists;
            }
            else {
                const exists = await this.prisma.reaction.findMany({
                    where: {
                        userId: reactionData.userId,
                        commentId: reactionData.commentId,

                    },
                });
                return exists;
            }
        } catch (error) {
            throw error;
        }
    }
    async removeReaction(reactionData: ReactionDto): Promise<any> {
        try {
            if (reactionData.postId != -1) { // if postId is null, then it means that reaction is on a comment
                    const post = await this.prisma.post.update({
                        where: {
                            id: reactionData.postId,
                        },
                        data: {
                            likes: { decrement: 1 },
                        },
                    });
                    const reaction = await this.prisma.reaction.deleteMany({
                        where: {
                           
                            userId: reactionData.userId,
                            postId: reactionData.postId,
                            commentId: null,
                            }
                            
                    });
            }
            else {
                const comment = await this.prisma.comment.update({
                    where: {
                        id: reactionData.commentId,
                    },
                    data: {
                        likes: { decrement: 1 },
                    },
                });
                const reaction = await this.prisma.reaction.deleteMany({
                    where: {
                        
                        userId: reactionData.userId,
                        commentId: reactionData.commentId,
                        postId: null
                        },
                        
                });
            }
        } catch (error) {
            throw error;
        }
    }
}
