import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class ReactionDto {    
    @IsNumber()
    userId: number;

    @IsNumber()
    postId: number;

    @IsNumber()
    commentId: number;
  }