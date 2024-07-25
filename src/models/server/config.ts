import { Users, Client, Avatars, Databases, Storage } from "node-appwrite";

import env from "@/env";

let client = new Client();

client
  .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
  .setProject(env.appwrite.projectId) // Your project ID
  .setKey(env.appwrite.appwriteApiKey); // Your secret API key

const users = new Users(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, avatars, databases, storage, users };