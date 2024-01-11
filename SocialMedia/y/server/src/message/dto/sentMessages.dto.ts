import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SentMessagesDto{
    @IsNotEmpty()
    @IsNumber()
    senderId: number

    @IsNotEmpty()
    @IsNumber()
    receiverId: number
}