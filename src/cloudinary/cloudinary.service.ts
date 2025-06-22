import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from './config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    configureCloudinary(this.configService);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await v2.uploader.upload(file.path);
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const results = await Promise.all(
        files.map((file) => v2.uploader.upload(file.path)),
      );
      return results.map((result) => result.secure_url);
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
