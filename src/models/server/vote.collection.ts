import { db, voteCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { Permission } from "node-appwrite";

export default async function createVoteCollection() {
  try {
    // create collection
    await databases.createCollection(db, voteCollection, voteCollection, [
      Permission.read("any"),
      Permission.create("users"),
      Permission.read("users"),
      Permission.update("users"),
      Permission.delete("users"),
    ]);

    console.log("vote collection created");

    // add attributes
    await Promise.all([
      databases.createEnumAttribute(db, voteCollection, "type", ["question", "answer"], true),
      databases.createStringAttribute(db, voteCollection, "typeId", 50, true),
      databases.createEnumAttribute(db, voteCollection, "voteStatus", ["upvoted", "downVoted"], true),
      databases.createStringAttribute(db, voteCollection, "votedById", 50, false),
    ]);

    console.log("attributes added in vote collection");
  } catch (error) {
    console.log("Error creating vote collection: ", error);
  }
}
