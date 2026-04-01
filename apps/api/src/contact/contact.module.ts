import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ContactController],
  providers: [PrismaService],
})
export class ContactModule {}
