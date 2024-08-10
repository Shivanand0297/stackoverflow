import createAnswerCollection from "@/models/server/answer.collection";
import createQuestionCollection from "@/models/server/question.collections";
import createCommentCollection from "@/models/server/comment.collection";
import createVoteCollection from "@/models/server/vote.collection";
import getOrCreateStorage from "@/models/server/storageSetup";

export {
  createAnswerCollection,
  createCommentCollection,
  createQuestionCollection,
  createVoteCollection,
  getOrCreateStorage,
};
