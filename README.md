# @kasifraza/s3-upload-helper

[![npm version](https://img.shields.io/npm/v/@kasifraza/s3-upload-helper)](https://www.npmjs.com/package/@kasifraza/s3-upload-helper)
[![license](https://img.shields.io/npm/l/@kasifraza/s3-upload-helper)](https://github.com/kasifraza/s3-upload-helper/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@kasifraza/s3-upload-helper)](https://www.npmjs.com/package/@kasifraza/s3-upload-helper)

Simplified S3/Cloudflare R2 upload helper with presigned URLs, multipart support, and CDN path generation.

## Installation

```bash
npm install @kasifraza/s3-upload-helper @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Usage

```typescript
import { UploadService } from '@kasifraza/s3-upload-helper';

const uploader = new UploadService({
  bucket: 'my-bucket',
  region: 'us-east-1',
  cdnUrl: 'https://cdn.example.com',
});

// Generate a presigned upload URL
const { url, key } = await uploader.getPresignedUploadUrl('uploads/photo.png', 'image/png');

// Upload directly
await uploader.upload('uploads/photo.png', buffer, 'image/png');

// Get public URL
const publicUrl = uploader.getPublicUrl('uploads/photo.png');

// Generate unique key
const key = uploader.generateKey('uploads', 'photo.png');

// Delete
await uploader.delete('uploads/photo.png');
```

## Cloudflare R2

```typescript
const uploader = new UploadService({
  bucket: 'my-r2-bucket',
  region: 'auto',
  endpoint: 'https://<account-id>.r2.cloudflarestorage.com',
  credentials: { accessKeyId: '...', secretAccessKey: '...' },
  cdnUrl: 'https://assets.example.com',
});
```

## License

MIT
