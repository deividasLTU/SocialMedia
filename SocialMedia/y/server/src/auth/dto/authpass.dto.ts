import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthPassDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}