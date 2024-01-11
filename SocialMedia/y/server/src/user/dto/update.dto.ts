import {IsEmail, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class AuthUpdate{
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    gender: string;
}