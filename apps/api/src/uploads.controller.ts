import { Controller, Get, Param, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join, normalize, resolve } from 'path';
import type { Response } from 'express';

@Controller('uploads')
export class UploadsController {
    private readonly uploadsDir = resolve(process.cwd(), 'uploads');

    @Get(':filename')
    getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = normalize(join(this.uploadsDir, filename));

        // Prevent path traversal: resolved path must stay inside uploads dir
        if (!filePath.startsWith(this.uploadsDir + '/') && filePath !== this.uploadsDir) {
            throw new BadRequestException('Invalid filename');
        }

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        return res.sendFile(filePath);
    }
}
