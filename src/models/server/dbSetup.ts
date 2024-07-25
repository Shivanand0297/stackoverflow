import { db } from "@/models/name";
import { databases } from "@/models/server/config";
import {
  createAnswerCollection,
  createCommentCollection,
  createQuestionCollection,
  createVoteCollection,
  getOrCreateStorage,
} from "@/models/server";

export default async function getOrCreateDB() {
  try {
    await databases.get(db);
    console.log("Database connected");
  } catch (error) {
    try {
      // crete databases
      await databases.create(db, db);

      // create collection
      await Promise.all([
        createAnswerCollection(),
        createQuestionCollection(),
        createCommentCollection(),
        getOrCreateStorage(),
        createVoteCollection(),
      ]);

      console.log("Database created and connected");
    } catch (error) {
      console.log("Failed to create databases and connection :", error);
    }
  }
}
