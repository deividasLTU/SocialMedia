import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class ReportPostDto {
    
    @IsString()
    text: string;
    
    @IsNumber()
    userId: number;
    
    @IsNumber()
    postId: number;
  }