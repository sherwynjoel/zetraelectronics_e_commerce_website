import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
            scope: ['email', 'profile'],
        } as any);
    }

    async validate(_accessToken: string, _refreshToken: string, profile: any) {
        return {
            email: profile.emails[0].value,
            name: profile.displayName,
        };
    }
}
