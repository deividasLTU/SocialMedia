import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
    constructor(private readonly prisma: PrismaService) { }

    async createComment(commentData: CommentDto): Promise<any> {
        try {
            const comment = await this.prisma.comment.create({
                data: {
                    //username: commentData.username,
                    text: commentData.text,
                    //likes: commentData.likes,
                    userId: commentData.userId,
                    postId: commentData.postId,
                },
            });

            return comment;
        } catch (error) {
            throw error;
        }
    }
    async getComments(post: number): Promise<any> {
        //console.log('Type of post in service:', typeof post);
        //console.log('Value:', post);
        try {
            const comments = await this.prisma.comment.findMany({
                where: { postId: post },
                orderBy: {
                    likes: 'desc'
                  },
                include: {
                    user: true, // Include the user information
                  },
            });
            
            return comments;
        } catch (error) {
            throw error;
        }
    }
    async getUsername(userId: number): Promise<any> {
        try {
            const username = await this.prisma.user.findFirst({
                where: { id: userId },
            });
            
            return username;
        } catch (error) {
            throw error;
        }
    }
}