import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { IUserPrefs } from "@/store/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export const POST = async (request: NextRequest) => {
  try {
    const { votedById, voteStatus, type, typeId } = await request.json();

    // list documents based on the above data
    const documentList = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedById", votedById),
      // Query.equal("voteStatus", voteStatus), // ! was not present in the video
    ]);

    // when clicking on the same status
    if (documentList.documents.length) {
      await databases.deleteDocument(db, voteCollection, documentList.documents[0].$id);

      // remove the reputation as well
      const questionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      const authorPrefs = await users.getPrefs<IUserPrefs>(questionOrAnswer.authorId);

      await users.updatePrefs<IUserPrefs>(questionOrAnswer.authorId, {
        reputation:
          documentList.documents[0].voteStatus === "upVoted" ? authorPrefs.reputation - 1 : authorPrefs.reputation + 1,
      });
    }

    // when clicking downvote if upvote is already present
    // or prev vote does not exists or status changes
    if (documentList.documents[0].voteStatus !== voteStatus) {
      await databases.createDocument(db, voteCollection, ID.unique(), {
        type,
        typeId,
        voteStatus,
        votedById,
      });

      // Increate/Decrease the reputation of the question/answer author accordingly
      const questionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      const authorPrefs = await users.getPrefs<IUserPrefs>(questionOrAnswer.authorId);

      // if vote was present
      if (documentList.documents[0]) {
        await users.updatePrefs<IUserPrefs>(questionOrAnswer.authorId, {
          reputation:
            // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
            documentList.documents[0].voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1
              : Number(authorPrefs.reputation) + 1,
        });
      } else {
        await users.updatePrefs<IUserPrefs>(questionOrAnswer.authorId, {
          reputation:
            // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
            voteStatus === "upvoted" ? Number(authorPrefs.reputation) + 1 : Number(authorPrefs.reputation) - 1,
        });
      }

      const [upVotes, downVotes] = await Promise.all([
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("votedById", votedById),
          Query.equal("voteStatus", "upVoted"),
          Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("votedById", votedById),
          Query.equal("voteStatus", "downVoted"),
          Query.limit(1),
        ]),
      ]);

      return NextResponse.json(
        {
          data: {
            document: null,
            voteResult: upVotes.total - downVotes.total,
          },
          message: "Vote Withdrown",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error in voting",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
};
