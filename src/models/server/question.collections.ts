import { IndexType, Permission } from "node-appwrite";
import { db, questionCollection } from "@/models/name";
import { databases } from "./config";

export default async function createQuestionCollection() {
  try {
    // create collection
    await databases.createCollection(db, questionCollection, questionCollection, [
      Permission.read("any"),
      Permission.create("users"),
      Permission.read("users"),
      Permission.update("users"),
      Permission.delete("users"),
    ]);

    console.log("question collection created");

    // add attributes
    await Promise.all([
      databases.createStringAttribute(db, questionCollection, "title", 100, true),
      databases.createStringAttribute(db, questionCollection, "content", 10_000, true),
      databases.createStringAttribute(db, questionCollection, "authorId", 50, true),
      databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false),
      databases.createStringAttribute(db, questionCollection, "tags", 50, true, undefined, true),
    ]);

    console.log("attributes added in question collection");

    try {
      await Promise.all([
        databases.createIndex(db, questionCollection, "title", IndexType.Fulltext, ["title"], ["ASC"]),
        databases.createIndex(db, questionCollection, "content", IndexType.Fulltext, ["content"], ["ASC"]),
      ]);
    } catch (error) {
      console.log("Error Indexing Question collection: ", error)
    }

    console.log("question collection indexed");
  } catch (error) {
    console.log("Error creating question collection: ", error);
  }
}
