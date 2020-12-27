import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './core/config/config.module';
import { ConfigService } from './core/config/config.service';
import { AuthModule } from './auth/auth.module';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './core/guard/roles.guard';
import { SeedsModule } from './seeds/seed.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `${configService.get('DB_URL')}`,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    WinstonModule,
    SeedsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})

export class AppModule {
  static port: number | string;
  constructor(private _configService: ConfigService) {
    AppModule.port = this._configService.get('PORT');
    console.log('AppModule.port', AppModule.port);
  }
}
