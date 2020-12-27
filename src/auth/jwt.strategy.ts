import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '../core/config/config.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
            ignoreExpiration: true,
        });
    }
    
    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUserByJwt(payload);
        if (!user) {
            throw new UnauthorizedException();
        }
        return { user: user };
    }

}