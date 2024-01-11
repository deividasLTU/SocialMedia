import {
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AuthUpdate } from './dto/update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { join } from 'path';
import { map, Observable, of, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import * as express from 'express';
import { UserPassDto } from './dto/userPass.dto';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('update')
  update(@Body() dto: AuthUpdate) {
    return this.userService.update(dto);
  }
  @Delete('delete')
  delete(@Body() emailData: { email: string }) {
    return this.userService.delete(emailData);
  }

  @Get('all')
  getAll() {
    return this.userService.getAll();
  }
  @Get('find/:userId')
  find(@Param('userId') userId: string) {
    return this.userService.find(userId);
  }
  @Get('findByName/:username')
  findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }
  @Get('getName/:userId')
  getUserName(@Param('userId') userId: string) {
    return this.userService.findUserName(userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Req() req) {
    const user: User = req.user;

    return this.userService.updateImage(
      user.email,
      process.env.PHOTO_PATH + file.filename,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('logedInWithGoogle')
  isLogedInWithGoogle(@Req() req) {
    const user: User = req.user;
    if (user.googleID !== '') {
      return true;
    } else {
      return false;
    }
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('profile-image')
  findProfileImage(@Req() req) {
    const user: User = req.user;
    return user.profileImage;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('updatePassword')
  updatePass(@Body() dto: UserPassDto, @Req() req) {
    const user: User = req.user;
    return this.userService.updatePassword(dto, user.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId/profile-image')
  async getProfileImage(@Param('userId') userId: string) {
    const user = await this.userService.find(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.profileImage;
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':userId/logedInWithGoogle')
  async isLogedInWithGoogleUser(@Param('userId') userId: string) {
    const user = await this.userService.find(userId);
    if (user.googleID !== '') {
      return true;
    } else {
      return false;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/logedInWithGoogleById')
  async isLogedInWithGoogleUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (user.googleID !== '') {
      return true;
    } else {
      return false;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('follow')
  follow(@Body() users, @Req() req) {
    const user: User = req.user;
    return this.userService.follow(users, user.id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('isFollowing/:userPage')
  isFollowing(@Param('userPage') userPage: string, @Req() req) {
    const user: User = req.user;
    return this.userService.isFollowing(userPage, user.id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('followers/:userPage')
  followers(@Param('userPage') userPage: string) {
    return this.userService.followerCount(userPage);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('unFollow')
  unFollow(@Body() users, @Req() req) {
    const user: User = req.user;
    return this.userService.unFollow(users, user.id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('block/:userId')
  async block(@Param('userId') userIdToBlock: string, @Req() req) {
    const currentUserId = req.user.id;

    if (userIdToBlock === currentUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    try {
      // This is where you block the user. The exact implementation depends on your database setup.
      // For example, you might add the blocked user's ID to the current user's "blockedUsers" array.
      await this.userService.blockUser(currentUserId, userIdToBlock);

      return { message: 'User blocked successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error blocking user');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('isBlocked/:userId')
  async isBlocked(@Param('userId') userIdToCheck: string, @Req() req) {
    const currentUserId = req.user.id;

    try {
      // This is where you check if the user is blocked. The exact implementation depends on your database setup.
      // For example, you might check if the user's ID is in the current user's "blockedUsers" array.
      const isBlocked = await this.userService.isUserBlocked(
        currentUserId,
        userIdToCheck,
      );

      return isBlocked;
    } catch (error) {
      console.error(error);
      console.error(
        '------------------------------------------------------' + error,
      );
      throw new InternalServerErrorException('Error checking block status');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('unblock/:userId')
  async unblock(@Param('userId') userIdToUnblock: string, @Req() req) {
    const currentUserId = req.user.id;

    try {
      await this.userService.unblockUser(currentUserId, userIdToUnblock);

      return { message: 'User unblocked successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error unblocking user');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('isBlockedByUser/:userId')
  async isBlockedByUser(@Param('userId') userIdToCheck: string, @Req() req) {
    const currentUserId = req.user.id;

    try {
      const isBlocked = await this.userService.isUserBlockedByUser(
        currentUserId,
        userIdToCheck,
      );

      return { isBlocked };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error checking block status');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId/blockedUsers')
  async getUsersWhoBlockedMe(@Req() req) {
    const currentUserId = req.user.id;

    try {
      const blockedUsers =
        await this.userService.getUsersWhoBlockedUser(currentUserId);

      return { blockedUsers };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error fetching blocked users');
    }
  }
}
