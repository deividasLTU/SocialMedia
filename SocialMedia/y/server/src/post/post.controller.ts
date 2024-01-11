import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { ReportPostDto } from './dto/reportPost.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('post')
  async createPost(@Body() postData: PostDto): Promise<any> {
    return this.postService.createPost(postData);
  }

  @Get('all')
  async getAllPosts(@Query('searcherId') searcherId: string) {
    try {
      const posts = await this.postService.getAllPosts(searcherId);

      return posts.map((post) => ({
        ...post,
        userId: post.user.id,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error fetching posts');
    }
  }

  @Get('/user/:userId')
  async getUserPosts(@Param('userId') userId: string) {
    return this.postService.getAllUserPosts(userId);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }

  @Put(':postId')
  async updatePostById(
    @Param('postId') postId: string,
    @Body() postData: UpdatePostDto,
  ) {
    return this.postService.updatePostById(postId, postData);
  }

  @Delete(':postId')
  async deletePostById(@Param('postId') postId: number) {
    return this.postService.deletePostById(postId);
  }

  @Post('report')
  async reportPost(@Body() reportData: ReportPostDto): Promise<any> {
    return this.postService.reportPost(reportData);
  }
}
