import { Controller, Get, Body, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findAll();
    }

    @Get(':key')
    findOne(@Param('key') key: string) {
        return this.settingsService.findOne(key);
    }

    @Put(':key')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
        return this.settingsService.update(key, updateSettingDto);
    }
}
