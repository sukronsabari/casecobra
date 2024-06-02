"use server";

import { prisma } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";

export async function ChangeOrderStatus({
  id,
  newStatus,
}: {
  id: string;
  newStatus: OrderStatus;
}) {
  await prisma.order.update({
    where: { id },
    data: { status: newStatus },
  });
}
