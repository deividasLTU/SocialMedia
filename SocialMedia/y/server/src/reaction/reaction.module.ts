import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
    imports: [PrismaModule],
    controllers: [ReactionController],
    providers: [ReactionService],
})
export class ReactionModule { }