import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.systemSetting.findMany();
    }

    async findOne(key: string) {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new NotFoundException(`Setting ${key} not found`);
        }
        return setting;
    }

    async update(key: string, updateSettingDto: UpdateSettingDto) {
        return this.prisma.systemSetting.upsert({
            where: { key },
            update: {
                value: updateSettingDto.value,
                description: updateSettingDto.description,
            },
            create: {
                key,
                value: updateSettingDto.value,
                description: updateSettingDto.description,
            },
        });
    }
}
