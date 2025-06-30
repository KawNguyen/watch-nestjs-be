import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from './config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    configureCloudinary(this.configService);
  }

  async uploadImage(
    file: Express.Multer.File,
    width?: number,
    height?: number,
  ): Promise<{ public_id: string; secure_url: string }> {
    try {
      const transformationOptions =
        width && height
          ? { transformation: [{ width, height, crop: 'limit' }] }
          : {};

      const result = await v2.uploader.upload(file.path, transformationOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    width?: number,
    height?: number,
  ): Promise<{ public_id: string; secure_url: string }[]> {
    try {
      const results = await Promise.all(
        files.map((file) =>
          v2.uploader.upload(file.path, {
            ...(width && height
              ? { transformation: [{ width, height, crop: 'limit' }] }
              : {}),
          }),
        ),
      );

      return results.map((result) => ({
        public_id: result.public_id,
        secure_url: result.secure_url,
      }));
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await v2.uploader.destroy(publicId);
      console.log(`Image with public ID ${publicId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting image with public ID ${publicId}:`, error);
      throw error;
    }
  }
}
