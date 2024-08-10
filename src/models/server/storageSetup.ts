import { storage } from "@/models/server/config";
import { questionAttachmentBucket } from "@/models/name";
import { Permission } from "node-appwrite";

export default async function getOrCreateStorage() {
  try {
    await storage.getBucket(questionAttachmentBucket);
    console.log("Storage Connected");
  } catch (error) {
    try {
      await storage.createBucket(
        questionAttachmentBucket,
        questionAttachmentBucket,
        [
          Permission.read("any"),
          Permission.create("users"),
          Permission.read("users"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "jpeg", "gif", "webp", "heic"]
      );

      console.log("Bucket created and connected");
    } catch (error) {
      console.log("failed to create bucket :", error)
    }
  }
}
