import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import getOrCreateDB from "@/models/server/dbSetup";
import { getOrCreateStorage } from "@/models/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    await Promise.all([getOrCreateDB(), getOrCreateStorage()]);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        message: "Failed to create db or storage",
      },
      {
        status: 400,
      }
    );
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
