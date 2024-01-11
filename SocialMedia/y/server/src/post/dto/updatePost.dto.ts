import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdatePostDto {
    
    @IsString()
    text: string;
    
    @IsString()
    theme: string;
    
    @IsBoolean()
    WasEdited: boolean;
  }