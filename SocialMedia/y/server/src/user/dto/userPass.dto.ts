import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserPassDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}