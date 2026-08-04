import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "admin" | "customer";
  }

  interface Session {
    user: {
      role: "admin" | "customer";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "customer";
  }
}
