import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post('create')
    async createComment(@Body() commentData: CommentDto): Promise<any> {
        return this.commentService.createComment(commentData);
    }
    @Get('/:postId')
    async getCommentsForPost(@Param('postId') postId: any) {
        const postID: number = parseInt(postId);
        return this.commentService.getComments(postID);
    }
    @Get('/user/:userId')
    async getUsernameForComment(@Param('userId') userId: any) {
        const userID: number = parseInt(userId);
        return this.commentService.getUsername(userID);
    }
}