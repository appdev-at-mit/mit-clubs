import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env["AWS_REGION"],
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

const BUCKET_NAME = process.env["AWS_S3_BUCKET_NAME"]!;

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
}

export class S3Service {
  /**
   * Upload a file to S3
   */
  static async uploadFile(
    file: Express.Multer.File,
    folder: string = "club-profile-pictures"
  ): Promise<UploadResult> {
    try {
      // generate a unique filename
      const fileExtension = file.originalname.split(".").pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${uniqueFilename}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: "inline",
      });

      await s3Client.send(uploadCommand);

      const url = `https://${BUCKET_NAME}.s3.${
        process.env["AWS_REGION"] || "us-east-1"
      }.amazonaws.com/${key}`;

      return {
        url,
        key,
        filename: uniqueFilename,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error("Failed to delete file from S3");
    }
  }
}
