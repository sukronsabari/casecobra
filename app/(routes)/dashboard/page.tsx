import { prisma } from "@/lib/db";
import getSession from "@/lib/getSession";
import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { Admin } from "./Admin";

export default async function Dashboard() {
  const session = await getSession();
  const callbackUrl = encodeURIComponent(`/dashboard`);

  if (!session?.user.id) {
    redirect(`/?callbackUrl=${callbackUrl}`);
  }

  if (session.user.role !== UserRole.ADMIN) {
    return notFound();
  }

  const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
  const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30));

  const orders = await prisma.order.findMany({
    where: {
      isPaid: true,
      createdAt: {
        gte: lastWeek,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      shippingAddress: true,
      phoneConfiguration: { include: { imageConfiguration: true } },
    },
  });

  const lastWeekSum = await prisma.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: lastWeek,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const lastMonthSum = await prisma.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: lastMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const WEEKLY_GOAL = 500;
  const MONTHLY_GOAL = 2500;

  return (
    <Admin
      lastWeekSum={lastWeekSum._sum.amount ? lastWeekSum._sum.amount / 100 : 0}
      lastMonthSum={
        lastMonthSum._sum.amount ? lastMonthSum._sum.amount / 100 : 0
      }
      weeklyGoal={WEEKLY_GOAL}
      monthlyGoal={MONTHLY_GOAL}
      orders={orders}
    />
  );
}
