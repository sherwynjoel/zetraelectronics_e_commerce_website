import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma.service';

@Controller('contact')
export class ContactController {
    constructor(
        private mailerService: MailerService,
        private prisma: PrismaService
    ) { }

    @Post()
    async sendMessage(@Body() body: { name: string, email: string, subject: string, message: string }) {
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            throw new HttpException('Name, email, and message are required', HttpStatus.BAD_REQUEST);
        }

        const settings = await this.prisma.systemSetting.findMany();
        const s: any = settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        const adminEmail = s.STORE_EMAIL || 'admin@zetraelectronics.com';
        console.log(`[CONTACT] Attempting to send message to: ${adminEmail}`);

        try {
            await this.mailerService.sendMail({
                to: adminEmail,
                subject: `New Message from ${name}: ${subject || 'Contact Inquiry'}`,
                template: 'contact-message',
                context: {
                    name,
                    email,
                    subject,
                    message,
                }
            });

            return { success: true, message: 'Message sent successfully' };
        } catch (e) {
            console.error("Failed to send contact email", e);
            throw new HttpException('Server failed to send message. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
