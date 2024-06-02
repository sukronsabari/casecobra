"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getPaymentStatus({ orderId }: { orderId: string }) {
  const session = await auth();

  if (!session?.user.id) {
    throw new Error("Your not logged in, login to view this page!");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      billingAddress: true,
      shippingAddress: true,
      phoneConfiguration: {
        include: {
          imageConfiguration: true,
          phoneColor: true,
        },
      },
    },
  });

  console.log(order);
  if (!order) {
    throw new Error("This order does not exist!");
  }

  if (order.isPaid) {
    return order;
  } else {
    return null;
  }
}
