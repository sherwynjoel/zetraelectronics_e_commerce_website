import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UploadsController } from './uploads.controller';
import { SettingsModule } from './settings/settings.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    OrdersModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: parseInt(config.get<string>('SMTP_PORT') || '587', 10),
          secure: parseInt(config.get<string>('SMTP_PORT') || '587', 10) === 465,
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from:
            config.get<string>('MAIL_FROM') ||
            '"Zetra Electronics" <noreply@zetraelectronics.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    AuthModule,
    SettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, UploadsController],
  providers: [AppService],
})
export class AppModule { }
