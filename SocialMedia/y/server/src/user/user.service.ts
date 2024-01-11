import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUpdate } from './dto/update.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Observable } from 'rxjs';
import { User } from '@prisma/client';
import { UserPassDto } from './dto/userPass.dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateImage(email, fileName) {
    try {
      const image = await this.prisma.user.update({
        data: {
          profileImage: fileName,
        },
        where: {
          email: email,
        },
      });
      return image;
    } catch (e) {
      throw e;
    }
  }
  async update(dto: AuthUpdate) {
    try {
      const user = await this.prisma.user.update({
        data: {
          username: dto.username,
          gender: dto.gender,
        },
        where: {
          email: dto.email,
        },
      });
      return user;
    } catch (e) {
      throw e;
    }
  }
  async updatePassword(dto: UserPassDto, email: string) {
    const hash = await argon.hash(dto.password);
    try {
      const pass = await this.prisma.user.update({
        data: {
          hash: hash,
        },
        where: {
          email: email,
        },
      });
      return pass;
    } catch (e) {
      throw e;
    }
  }
  async delete(emailData: { email: string }) {
    try {
      const email = emailData.email;
      const userIdToDelete = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
      });
      const deletedUser = await this.prisma.user.delete({
        where: { email: email },
      });

      if (!deletedUser) {
        throw new Error('Invalid Email');
      }
      return deletedUser;
    } catch (e) {}
  }

  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        googleID: true,
      },
    });
  }
  async find(userId: string): Promise<any> {
    console.log('finding..', userId);
    return this.prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
      /*select: {
        id: true,
        username: true,
      },*/
    });
  }
  async findByUsername(username: string): Promise<any> {
    //console.log('finding..', userId);
    return this.prisma.user.findFirst({
      where: {
        username: username,
      },
      /*select: {
        id: true,
        username: true,
      },*/
    });
  }

  async findById(id: number): Promise<any> {
    //console.log('finding..', username);
    return this.prisma.user.findFirst({
      where: {
        id: id,
      },
      /*select: {
        id: true,
        username: true,
      },*/
    });
  }

  async findProfileImage(username: string): Promise<any> {
    // console.log("finding profile image..", username);
    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
      select: {
        profileImage: true,
      },
    });

    if (!user || !user.profileImage) {
      throw new Error('Profile image not found');
    }

    return user.profileImage;
  }

  findUserName(userId: string) {
    return this.prisma.user.findFirst({
      select: {
        username: true,
      },
      where: {
        id: Number(userId),
      },
    });
  }

  follow(following, followed) {
    return this.prisma.follow.create({
      data: {
        followedById: followed,
        followingId: Number(following.following),
      },
    });
  }

  isFollowing(following, followed) {
    return this.prisma.follow.findFirst({
      where: {
        followedById: followed,
        followingId: Number(following),
      },
    });
  }

  unFollow(following, followed) {
    return this.prisma.follow.deleteMany({
      where: {
        followedById: followed,
        followingId: Number(following.following),
      },
    });
  }

  async blockUser(currentUserId: string, userIdToBlock: string) {
    try {
      const block = await this.prisma.block.create({
        data: {
          blockerId: Number(currentUserId),
          blockedId: Number(userIdToBlock),
        },
      });
      return block;
    } catch (e) {
      throw e;
    }
  }

  async isUserBlocked(currentUserId: string, userIdToCheck: string) {
    try {
      const blockRecord = await this.prisma.block.findFirst({
        where: {
          blockerId: Number(currentUserId),
          blockedId: Number(userIdToCheck),
        },
      });

      return blockRecord !== null;
    } catch (e) {
      throw e;
    }
  }

  async unblockUser(currentUserId: string, userIdToUnblock: string) {
    try {
      const unblockRecord = await this.prisma.block.deleteMany({
        where: {
          blockerId: Number(currentUserId),
          blockedId: Number(userIdToUnblock),
        },
      });

      return unblockRecord;
    } catch (e) {
      throw e;
    }
  }

  async isUserBlockedByUser(currentUserId: string, userIdToCheck: string) {
    try {
      const blockRecord = await this.prisma.block.findFirst({
        where: {
          blockerId: Number(userIdToCheck),
          blockedId: Number(currentUserId),
        },
      });

      return blockRecord !== null;
    } catch (e) {
      throw e;
    }
  }

  async getUsersWhoBlockedUser(currentUserId: string) {
    try {
      const blockRecords = await this.prisma.block.findMany({
        where: {
          blockedId: Number(currentUserId),
        },
      });

      return blockRecords.map((record) => record.blockerId);
    } catch (e) {
      throw e;
    }
  }

  async followerCount(userPage: string) {
    try {
      const followerCount = await this.prisma.follow.count({
        where: {
          followingId: Number(userPage),
        },
      });
      return followerCount;
    } catch (e) {
      throw e;
    }
  }
}