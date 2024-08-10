import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";

import { account } from "@/models/client/config";

export interface IUserPrefs {
  reputation: number;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<IUserPrefs> | null;
  hydrated: boolean;
  setHydrated: () => void;
  verifySession: () => Promise<any>;
  login: (email: string, password: string) => Promise<{ success: boolean; error: AppwriteException | null }>;
  createAccount: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error: AppwriteException | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,
      setHydrated: () => set((state) => ({ ...state, hydrated: true })),
      verifySession: async () => {
        try {
          const currentSession = await account.getSession("current");
          set({ session: currentSession });
        } catch (error) {
          console.log("no session found: ", error);
        }
      },
      login: async (email, password) => {
        try {
          const session = await account.createEmailPasswordSession(email, password);
          const [user, { jwt }] = await Promise.all([account.get<IUserPrefs>(), account.createJWT()]);

          // at the time of login if reputation is not present set it to 0
          if (!user.prefs.reputation) {
            await account.updatePrefs<IUserPrefs>({
              reputation: 0,
            });
          }

          set({ session, user, jwt });

          return {
            success: true,
            error: null,
          };
        } catch (error) {
          console.log("faild to create email password session", error);

          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },
      createAccount: async (name, email, password) => {
        try {
          await account.create(ID.unique(), email, password, name);

          return {
            success: true,
            error: null,
          };
        } catch (error) {
          console.log("faild to create account: ", error);

          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },
      logout: async () => {
        try {
          await account.deleteSessions();
          set({ session: null, jwt: null, user: null, hydrated: false });
        } catch (error) {
          console.log("failed to logout: ", error);
        }
      },
      // inc: () => set((state) => ({ count: state.count + 1 })),
    })),
    {
      name: "auth",
      onRehydrateStorage: (state) => {
        console.log("hydration starts");

        // optional
        return (state, error) => {
          if (error) {
            console.log("an error happened during hydration", error);
          } else {
            console.log("hydration finished");
            state?.setHydrated();
          }
        };
      },
    }
  )
);
