import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class MessageDto{
    @IsNotEmpty()
    @IsNumber()
    senderId: number

    @IsNotEmpty()
    @IsNumber()
    receiverId: number

    @IsString()
    messageContent : string

    @IsOptional()
    @IsString()
    messageImage? : string
}