import { prisma } from "@/lib/prisma";

export async function hasAccessToEbook(customerId: string, ebookId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { customerId },
  });
  if (subscription?.status === "active") return true;

  const paidOrder = await prisma.order.findFirst({
    where: { customerId, ebookId, status: "paid" },
  });
  return Boolean(paidOrder);
}
