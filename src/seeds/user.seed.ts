import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../auth/dto/auth-credentials.dto';
import { Role } from '../core/enums/role.enum';

import { TokenVerifyEmail, User } from '../auth/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v1 as uuidv1 } from 'uuid';

@Injectable()
export class UserSeed {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('TokenVerifyEmail') private tokenVerifyEmailModel: Model<TokenVerifyEmail>,
    ) { }

    @Command({ command: 'create:user', describe: 'create a user', autoExit: true })
    async create() {
        try {
            console.log('### Seeding user ###');
            const adminEmail = 'admin@gmail.com';
            const userData = new CreateUserDto();
            userData.email = adminEmail;
            userData.name = 'Administrator';
            userData.password = 'qwerty';
            userData.roles = [Role.Admin];
            const newUser = new this.userModel({
                ...userData,
                emailVerified: true,
            });
            return await newUser.save().then((user) => {
                const newTokenVerifyEmail = new this.tokenVerifyEmailModel({
                    userId: user._id,
                    tokenVerifyEmail: uuidv1(),
                });
                newTokenVerifyEmail.save();
                const result = user.toObject({ versionKey: false });
                console.log('### Success seed user ###');
                return result;
            });
        } catch (error) {
            console.log('### Error while seeding user ###', error);
        }
    }
}