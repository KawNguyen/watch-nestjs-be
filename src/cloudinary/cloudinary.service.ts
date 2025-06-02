import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
  ) {}

  async uploadImageFromBuffer(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any> {
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '');
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', public_id: cleanFileName },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async uploadImage(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinaryInstance.uploader.upload(filePath, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

}
