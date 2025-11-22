export interface S3Dao {
  uploadImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
  getImageUrl(key: string): Promise<string>;
}