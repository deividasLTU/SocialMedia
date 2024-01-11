import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Prisma } from '@prisma/client';
import { UserService } from '../user/user.service';
import { ReportPostDto } from './dto/reportPost.dto';
import { report } from 'process';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createPost(postData: PostDto): Promise<any> {
    try {
      const quotedPostId = postData.quotedPostId != -1 ? postData.quotedPostId : null;
      const post = await this.prisma.post.create({
        data: {
          text: postData.text,
          theme: postData.theme,
          WasEdited: postData.WasEdited,
          userId: postData.userId,
          quotedPostId: quotedPostId,
        },
      });

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getAllPosts(searcherId: string): Promise<any> {
    const blockedUserIds =
      await this.userService.getUsersWhoBlockedUser(searcherId);

    try {
      const posts = await this.prisma.post.findMany({
        where: {
          user: {
            id: {
              notIn: blockedUserIds,
            },
          },
        },
        include: {
          user: true,
        },
      });

      const postsWithUsername = posts.map((post) => ({
        ...post,
        username: post.user.username,
        ProfileImage: post.user.profileImage,
        userId: post.user.id,
      }));

      return postsWithUsername;
    } catch (error) {
      throw error;
    }
  }

  async getPostById(
    postId: string,
  ): Promise<Prisma.PostGetPayload<{ include: { user: true } }>> {
    const post = await this.prisma.post.findUnique({
      where: { id: Number(postId) },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updatePostById(
    postId: string,
    postData: UpdatePostDto,
  ): Promise<Prisma.PostGetPayload<{ include: { user: true } }>> {
    const post = await this.prisma.post.update({
      where: { id: Number(postId) },
      data: {
        text: postData.text,
        theme: postData.theme,
        WasEdited: true,
      },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async deletePostById(
    postId: number,
  ): Promise<Prisma.PostGetPayload<{ include: { user: true } }>> {
    let post;
    try {
      post = await this.prisma.post.findUnique({
        where: { id: Number(postId) },
        include: { user: true },
      });
    } catch (error) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({
      where: { id: Number(postId) },
    });

    return post;
  }

  async getAllUserPosts(userId: string) {
    try {
      const posts = await this.prisma.post.findMany({
        where: { userId: Number(userId) },
        include: {
          user: true, // Include the related user data
        },
      });

      // Map the posts to include the username and ProfileImage in each post
      const postsWithUsername = posts.map((post) => ({
        ...post,
        username: post.user.username, // Add the username to the post
        ProfileImage: post.user.profileImage, // Add the ProfileImage to the post
        userId: post.user.id,
      }));

      return postsWithUsername;
    } catch (error) {
      throw error;
    }
  }
  async reportPost(reportData: ReportPostDto): Promise<any> {
    try {
      const report = await this.prisma.report.create({
        data: {
          text: reportData.text,
          userId: reportData.userId,
          postId: reportData.postId,
        },
      });

      return report;
    } catch (error) {
      throw error;
    }
  }
}
