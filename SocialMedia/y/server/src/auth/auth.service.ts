import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, AuthlogDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { AuthForgDto } from './dto/authforg.dto';
import { AuthPassDto } from './dto/authpass.dto';
import * as process from "process";

class User {
  id: number;
  username: string;
  profileImage: string;
  googleId: string;
  email: string;
}
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async signin(dto: AuthlogDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Incorrect credentials');
    }

    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect credentials');
    }
    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
          gender: dto.gender,
          profileImage: process.env.PHOTO_PATH + dto.profileImage,
        },
      });
      //await this.mailService.sendUserConfirmation(user, 'test');
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signInWithGoogle(data) {
    if (!data.user) throw new BadRequestException();
    let user = await this.prisma.user.findUnique({
      where: {
        googleID: data.user.googleID,
        email: data.user.email,
      },
    });
    if (user) return this.signToken(user.id, user.email);

    user = await this.prisma.user.findUnique({
      where: {
        email: data.user.email,
      },
    });
    if (user)
      throw new ForbiddenException(
        "User already exists, but Google account was not connected to user's account",
      );
    try {
      const newUser = new User();
      newUser.username = data.user.firstName + ' ' + data.user.lastName;
      newUser.email = data.user.email;
      newUser.googleId = data.user.googleID;
      newUser.profileImage = data.user.picture;
      await this.prisma.user.create({
        data: {
          username: newUser.username,
          email: newUser.email,
          gender: data.user.gender + '',
          googleID: newUser.googleId,
          //profileImage: 'placeHolderProfile.jpg',
          hash: '',
          profileImage: newUser.profileImage,
        },
      });
      //await this.store(newUser);
      const user = await this.prisma.user.findUnique({
        where: {
          email: newUser.email,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (e) {
      throw new Error(e);
    }
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
  async uploadImage(email: string, fileName: string) {
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

  async sendForgot(dto: AuthForgDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (user) {
        const token = await this.resetToken(user.id, user.email);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { resetPassToken: token },
        });
        await this.mailService.sendForgotPass(user, await token);
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  }
  async resetToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: secret,
    });

    return token;
  }

  async passReset(dto: AuthPassDto, email) {
    const hash = await argon.hash(dto.password);
    await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        hash: hash,
      },
    });
  }
}
