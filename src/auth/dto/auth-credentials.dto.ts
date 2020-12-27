import { IsString, IsEmail, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../core/enums/role.enum';

export class AuthCredentialsDto {
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsArray()
    @ApiProperty()
    roles: Role[];

    @IsString()
    @ApiProperty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}

export class AuthEmailDto {
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;
}

export class UpdateUserDto {
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @ApiProperty()
    name: string;
}