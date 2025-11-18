export interface S3Dao {
    uploadImage(key: string, file: Buffer): Promise<string>;
    deleteImage(key: string): Promise<void>;
    getImageUrl(key: string): Promise<string>;
}