import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { TokenVerifyEmailSchema, UserSchema } from '../auth/user.model';

import { UserSeed } from './user.seed';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'TokenVerifyEmail', schema: TokenVerifyEmailSchema }
        ]),
        CommandModule,
    ],
    providers: [UserSeed],
    exports: [UserSeed],
})
export class SeedsModule {}