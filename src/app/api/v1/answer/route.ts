import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { IUserPrefs } from "@/store/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export const POST = async (request: NextRequest) => {
  try {
    const { question, answer, authorId } = await request.json();

    const response = await databases.createDocument(db, answerCollection, ID.unique(), {
      question: question,
      content: answer,
      authorId: authorId,
    });

    //? Increase the reputation of the author since the question is being answered
    const prefs = await users.getPrefs<IUserPrefs>(authorId);
    await users.updatePrefs(authorId, {
      reputation: prefs.reputation + 1,
    });

    return NextResponse.json(
      {
        data: response,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { answerId } = await request.json();

    const answerDocument = await databases.getDocument(db, answerCollection, answerId);

    if (!answerDocument) {
      return NextResponse.json(
        {
          message: `Answer document not found for ${answerId} id`,
        },
        {
          status: 400,
        }
      );
    }

    const response = await databases.deleteDocument(db, answerCollection, answerId);

    // Decrease the reputation as answer is deleted
    const prefs = await users.getPrefs<IUserPrefs>(answerDocument.authorId);
    await users.updatePrefs(answerDocument.authorId, {
      reputation: prefs.reputation - 1,
    });

    return NextResponse.json(
      {
        data: response,
        message: "Answer deleted successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
};
