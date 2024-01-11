import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionDto } from './dto/reaction.dto';

@Controller('reactions')
export class ReactionController {
    constructor(private readonly reactionService: ReactionService) { }

    @Post('add')
    async addReaction(@Body() reactionData: ReactionDto): Promise<any> {
        return this.reactionService.addReaction(reactionData);
    }
    @Get('check')
    async checkForExistingReaction(@Query() params: any): Promise<any> {
        var reactionParams = new ReactionDto;
        reactionParams.commentId = parseInt(params.commentId);
        reactionParams.userId = parseInt(params.userId);
        reactionParams.postId = parseInt(params.postId);
        //console.log("params_input", params);
        //console.log("params", reactionParams);
        return this.reactionService.checkForExistingReaction(reactionParams);
    }
    @Post('remove')
    async removeReaction(@Body() reactionData: ReactionDto): Promise<any> {
        return this.reactionService.removeReaction(reactionData);
    }
}