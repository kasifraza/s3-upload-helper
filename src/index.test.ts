import { UploadService } from './index';

jest.mock('@aws-sdk/client-s3', () => {
  const send = jest.fn().mockResolvedValue({});
  return {
    S3Client: jest.fn(() => ({ send })),
    PutObjectCommand: jest.fn((input) => ({ input })),
    DeleteObjectCommand: jest.fn((input) => ({ input })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://presigned-url.example.com'),
}));

const config = { bucket: 'test-bucket', region: 'us-east-1' };

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => { service = new UploadService(config); });

  it('getPresignedUploadUrl returns url and key', async () => {
    const result = await service.getPresignedUploadUrl('test.png', 'image/png');
    expect(result).toEqual({ url: 'https://presigned-url.example.com', key: 'test.png' });
  });

  it('upload sends PutObjectCommand', async () => {
    await expect(service.upload('test.png', Buffer.from('data'), 'image/png')).resolves.toBeUndefined();
  });

  it('delete sends DeleteObjectCommand', async () => {
    await expect(service.delete('test.png')).resolves.toBeUndefined();
  });

  it('getPublicUrl returns S3 url without cdnUrl', () => {
    expect(service.getPublicUrl('img.png')).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/img.png');
  });

  it('getPublicUrl returns CDN url when configured', () => {
    const s = new UploadService({ ...config, cdnUrl: 'https://cdn.example.com' });
    expect(s.getPublicUrl('img.png')).toBe('https://cdn.example.com/img.png');
  });

  it('generateKey creates unique key with prefix and extension', () => {
    const key = service.generateKey('uploads', 'photo.jpg');
    expect(key).toMatch(/^uploads\/[a-f0-9-]+\.jpg$/);
  });
});
