import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class PostDto {
    
    @IsString()
    text: string;
    
    @IsString()
    theme: string;
    
    @IsBoolean()
    WasEdited: boolean;
    
    @IsNumber()
    userId: number;

    @IsNumber()
    quotedPostId: number;
  }