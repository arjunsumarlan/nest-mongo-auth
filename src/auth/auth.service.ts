import { Injectable, UnauthorizedException, BadRequestException, ArgumentsHost } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto, AuthEmailDto, CreateUserDto, UpdateUserDto } from './dto/auth-credentials.dto';
import { AuthLoginMetadata, JwtPayload } from './jwt-payload.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenVerifyEmail, User, } from './user.model';
import { v1 as uuidv1 } from 'uuid';
import { SendEmailMiddleware } from './../core/middleware/send-email.middleware';
import { RequestContextMetadataService } from '../core/services/request-context-metadata.service';
import { ConfigService } from '../core/config/config.service';
import { Role } from '../core/enums/role.enum';
import { use } from 'passport';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('TokenVerifyEmail') private tokenVerifyEmailModel: Model<TokenVerifyEmail>,
        private jwtService: JwtService,
        private sendEmailMiddleware: SendEmailMiddleware,
        private configService: ConfigService,
    ) { }

    async createUser(createUserDto: CreateUserDto) {
        if (!(createUserDto.roles.includes(Role.Admin) || createUserDto.roles.includes(Role.User))) {
            throw new BadRequestException(`roles must include one of 'admin' or 'user'`);
        }

        let userToAttempt = await this.findOneByEmail(createUserDto.email);
        if (!userToAttempt) {
            const newUser = new this.userModel({
                email: createUserDto.email,
                name: createUserDto.name,
                roles: createUserDto.roles,
                password: createUserDto.password
            });
            return await newUser.save().then((user) => {
                const newTokenVerifyEmail = new this.tokenVerifyEmailModel({
                    userId: user._id,
                    tokenVerifyEmail: uuidv1()
                });
                newTokenVerifyEmail.save();

                this.sendEmailMiddleware.sendEmail(user.email, newTokenVerifyEmail.tokenVerifyEmail, []);
                return user.toObject({ versionKey: false });
            });
        } else {
            throw new BadRequestException('Email already exist!');
        }
    }

    async deleteUser(auth: AuthEmailDto) {
        if (!auth.email) {
            throw new BadRequestException('Email have to be provided.');
        }

        const authMeta = RequestContextMetadataService.getMetadata('AUTH_METADATA') as AuthLoginMetadata;
        if (!!authMeta) {
            try {
                return await this.userModel.findOneAndRemove({ email: auth.email })
                    .then(e => {
                        return `Success delete ${auth.email} account.`
                    }).catch(e => {
                        return new BadRequestException('Email is not exist!');
                    });
            } catch (e) {
                console.log('error', e);
            }
        } else {
            throw new UnauthorizedException();
        }
    }

    async updateUser(updateUserDto: UpdateUserDto): Promise<any> {
        const authMeta = RequestContextMetadataService.getMetadata('AUTH_METADATA') as AuthLoginMetadata;
        if (!!authMeta) {
            try {
                return await this.findOneByEmail(updateUserDto.email)
                    .then((data) => {
                        if (data) {
                            return this.userModel.findByIdAndUpdate(
                                { _id: data._id },
                                {
                                    email: updateUserDto.email,
                                    name: updateUserDto.name
                                },
                                { new: true }).then(user => {
                                    console.log('### User Updated ###', user.toObject({ versionKey: false }));
                                    return user;
                                });
                        } else { 
                            throw new UnauthorizedException();
                        }
                    });
            } catch (e) {
                console.log('error', e);
            }
        } else {
            throw new UnauthorizedException();
        }
    }

    async validateUserByPassword(authCredentialsDto: AuthCredentialsDto) {
        const userToAttempt: any = await this.findOneByEmail(authCredentialsDto.email);
        if (!userToAttempt) throw new BadRequestException('Email not found !');
        return new Promise((resolve, reject) => {
            userToAttempt.checkPassword(authCredentialsDto.password, (err, isMatch) => {
                if (err) {
                    reject(new UnauthorizedException());
                }
                if (isMatch) {
                    const payload: any = {
                        token: this.createJwtPayload(userToAttempt),
                    }
                    const user = userToAttempt.toObject({ versionKey: false });
                    if (user.emailVerified) {
                        RequestContextMetadataService.setMetadata('AUTH_METADATA', user);
                        resolve(payload);
                    } else {
                        reject(new UnauthorizedException('Please verify your email before login.'));
                    }
                } else {
                    reject(new BadRequestException(`Password don't match`));
                }
            });
        });
    }

    async findOneByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email: email });
    }

    async getAllUsers() {
        return this.userModel.find();
    }

    async getUserFromAuth(): Promise<any> {
        const authMeta = RequestContextMetadataService.getMetadata('AUTH_METADATA') as AuthLoginMetadata;
        if (!!authMeta) {
            const { email } = authMeta;
            const user = await this.findOneByEmail(email).then(u => u.toObject({ versionKey: false }));
            if (!user) {
                throw new UnauthorizedException();
            }
            return user;
        } else {
            throw new UnauthorizedException();
        }
    }

    async validateUserByJwt(payload: JwtPayload) {
        let user = await this.findOneByEmail(payload.email).then(u => u.toObject({ versionKey: false }));
        if (user) {
            RequestContextMetadataService.setMetadata('AUTH_METADATA', user);
            return user;
        } else {
            throw new UnauthorizedException();
        }
    }

    createJwtPayload(user) {
        let data: JwtPayload = {
            _id: user._id,
            roles: user.roles,
            email: user.email
        };
        return this.jwtService.sign(data);
    }

    async verifyTokenByEmail(token: string) {
        try {
            return await this.tokenVerifyEmailModel.findOne({ tokenVerifyEmail: token })
                .then((data) => {
                    if (data) {
                        return this.userModel.findByIdAndUpdate(
                            { _id: data.userId },
                            { emailVerified: true },
                            { new: true }).then(() => {
                                return true;
                            });
                    } else {
                        return false;
                    }
                });
        } catch (e) {
            console.log('error', e);
        }
    }

}

