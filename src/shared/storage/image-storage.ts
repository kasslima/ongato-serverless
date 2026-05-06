export interface IImageUploadRepository {
  upload(buffer: ArrayBuffer, fileName: string, contentType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

export class R2ImageUploadRepository implements IImageUploadRepository {
  constructor(
    private readonly bucket: R2Bucket,
    private readonly publicUrl: string
  ) {}

  async upload(buffer: ArrayBuffer, fileName: string, contentType: string): Promise<string> {
    const key = `${Date.now()}-${fileName}`;

    await this.bucket.put(key, buffer, {
      httpMetadata: {
        contentType,
      },
    });

    return `${this.publicUrl}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, "");
    await this.bucket.delete(key);
  }
}

