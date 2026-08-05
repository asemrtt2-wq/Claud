import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentCustomer() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "customer" || !session.user.email) {
    return null;
  }

  return prisma.customer.findUnique({ where: { email: session.user.email } });
}
