import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class CommentDto {
    @IsString()
    username: string;

    @IsString()
    text: string;
    
    @IsNumber()
    likes: number;
    
    @IsNumber()
    userId: number;

    @IsNumber()
    postId: number;
  }