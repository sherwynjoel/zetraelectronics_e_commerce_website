import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(private config: ConfigService) {
        cloudinary.config({
            cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: config.get<string>('CLOUDINARY_API_KEY'),
            api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    uploadBuffer(buffer: Buffer, folder = 'zetra-products'): Promise<string> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result!.secure_url);
                },
            );
            Readable.from(buffer).pipe(stream);
        });
    }
}
