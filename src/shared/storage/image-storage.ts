export interface IImageUploadRepository {
  upload(buffer: ArrayBuffer, fileName: string, contentType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

export class MockImageUploadRepository implements IImageUploadRepository {
  async upload(buffer: ArrayBuffer, fileName: string, contentType: string): Promise<string> {
    console.log(`Mock upload: received ${buffer.byteLength} bytes for ${fileName} (${contentType})`);
    // Simulando um tempo de upload
    await new Promise((resolve) => setTimeout(resolve, 500));
    const randomId = Math.random().toString(36).substring(7);
    return `https://mock-storage.com/images/${randomId}-${fileName}`;
  }

  async delete(url: string): Promise<void> {
    console.log(`Mock delete: removing image at ${url}`);
    // Simulando tempo de deleção
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
