export interface S3Dao {
  uploadImage(fileName: string, imageBase64: string, extension: string): Promise<string>;
  getImageUrl(key: string): Promise<string>;
}