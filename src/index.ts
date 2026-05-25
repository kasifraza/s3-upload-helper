import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface UploadServiceConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
  cdnUrl?: string;
}

export class UploadService {
  private client: S3Client;
  private config: UploadServiceConfig;

  constructor(config: UploadServiceConfig) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
      forcePathStyle: !!config.endpoint,
    });
  }

  async getPresignedUploadUrl(key: string, contentType?: string, expiresIn = 3600): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ...(contentType && { ContentType: contentType }),
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, key };
  }

  async upload(key: string, body: Buffer | string | ReadableStream, contentType?: string): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: body as any,
      ...(contentType && { ContentType: contentType }),
    }));
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));
  }

  getPublicUrl(key: string): string {
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  generateKey(prefix: string, filename: string): string {
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
    return `${prefix}/${randomUUID()}${ext}`;
  }
}
