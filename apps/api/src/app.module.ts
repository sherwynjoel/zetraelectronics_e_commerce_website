import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
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
import { ContactModule } from './contact/contact.module';
import { CategoriesModule } from './categories/categories.module';
import { existsSync } from 'fs';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ProductsModule,
    OrdersModule,
    ContactModule,
    CategoriesModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const templateDir = existsSync(join(__dirname, 'templates'))
          ? join(__dirname, 'templates')
          : join(process.cwd(), 'dist', 'templates');

        return {
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
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 30 },
      { name: 'auth', ttl: 60000, limit: 5 },
      { name: 'strict', ttl: 60000, limit: 3 },
    ]),
    AuthModule,
    SettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, UploadsController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
