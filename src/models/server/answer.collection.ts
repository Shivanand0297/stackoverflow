import { Permission } from "node-appwrite";
import { answerCollection, db } from "@/models/name";
import { databases } from "./config";

export default async function createAnswerCollection() {
  try {
    // create collection
    await databases.createCollection(db, answerCollection, answerCollection, [
      Permission.read("any"),
      Permission.create("users"),
      Permission.read("users"),
      Permission.update("users"),
      Permission.delete("users"),
    ]);

    console.log("answer collection created");

    // add attributes
    await Promise.all([
      databases.createStringAttribute(db, answerCollection, "questionId", 50, true),
      databases.createStringAttribute(db, answerCollection, "content", 10_000, true),
      databases.createStringAttribute(db, answerCollection, "authorId", 50, true),
    ]);

    console.log("attributes added in answer collection");

  } catch (error) {
    console.log("Error creating answer collection: ", error);
  }
}
