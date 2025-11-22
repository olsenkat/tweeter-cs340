import { S3Dao } from "../interfaces/S3Dao";
import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";

const BUCKET = "tweeter-server-deploy-bucket"
const REGION = "us-west-2"

export class S3ImageDao implements S3Dao {

  async uploadImage(fileName: string, imageStringBase64Encoded: string): Promise<string> {
    const key = "image/" + fileName
    await this.putImage(key, imageStringBase64Encoded);
    return key;
  }
  async getImageUrl(key: string): Promise<string> {
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
  }

  async putImage(
    key: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );
    const s3Params = {
      Bucket: BUCKET,
      Key: key,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    const client = new S3Client({ region: REGION });
    try {
      await client.send(c);
      return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }
}
