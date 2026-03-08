import { withAuth } from "next-auth/middleware";

// Require auth for everything except NextAuth routes.
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
