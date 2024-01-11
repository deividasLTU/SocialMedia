import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { ReactionModule } from './reaction/reaction.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PostModule,
    PrismaModule,
    CommentModule,
    MessageModule,
    ReactionModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
