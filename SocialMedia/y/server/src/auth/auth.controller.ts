import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, AuthlogDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { join } from 'path';
import { AuthGuard } from '@nestjs/passport';
import {AuthForgDto} from "./dto/authforg.dto";
import {AuthPassDto} from "./dto/authpass.dto";

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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    console.log(dto);
    return this.authService.signup(dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('passReset')
  passReset(@Body() dto: AuthPassDto,@Req() req){
  return this.authService.passReset(dto,req.user.email);
  }

  @Post('forgotPass')
  forgot(@Body() dto: AuthForgDto) {
    console.log(dto);
    return this.authService.sendForgot(dto);
  }

  @Post('signin')
  signin(@Body() dto: AuthlogDto) {
    console.log(dto);
    return this.authService.signin(dto);
  }
  @Post('upload/:email')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Param('email') email: string) {
    return this.authService.uploadImage(
      email,
      process.env.PHOTO_PATH + file.filename,
    );
  }
  @UseGuards(AuthGuard('google'))
  @Get('google')
  async signInWithGoogle() {}

  @UseGuards(AuthGuard('google'))
  @Get('google/redirect')
  async signInWithGoogleRedirect(@Req() req, @Res() res) {
    const auth = await this.authService.signInWithGoogle(req);
    res.redirect(
      `http://localhost:3000/google-oauth-success-redirect/${auth.access_token}`,
    );
  }
}
