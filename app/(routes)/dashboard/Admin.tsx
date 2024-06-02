"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { Order, ShippingAddress, User } from "@prisma/client";
import { StatusDropdown } from "./StatusDropdown";
import { SectionWrapper } from "@/components/SectionWrapper";

type OrderProps = ({
  user: User;
  shippingAddress: ShippingAddress | null;
} & Order)[];

interface AdminProp {
  /** in dollar */
  lastWeekSum: number;
  /** in dollar */
  lastMonthSum: number;
  /** in dollar */
  weeklyGoal: number;
  /** in dollar */
  monthlyGoal: number;
  orders: OrderProps;
}

export function Admin({
  lastWeekSum,
  lastMonthSum,
  weeklyGoal,
  monthlyGoal,
  orders,
}: AdminProp) {
  return (
    <SectionWrapper className="flex-1 flex flex-col">
      <div className="flex min-h-screen w-full bg-muted/40">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
          <div className="flex flex-col gap-16">
            <div className="pt-8 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last Week</CardDescription>
                  <CardTitle className="text-4xl">
                    {formatPrice(lastWeekSum)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    of {formatPrice(weeklyGoal)} goal
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    className="h-2"
                    value={((lastWeekSum ?? 0) * 100) / weeklyGoal}
                  />
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last Month</CardDescription>
                  <CardTitle className="text-4xl">
                    {formatPrice(lastMonthSum)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    of {formatPrice(monthlyGoal)} goal
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    className="h-2"
                    value={((lastMonthSum ?? 0) * 100) / monthlyGoal}
                  />
                </CardFooter>
              </Card>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Incoming orders
            </h1>

            <div className="-mx-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Purchase date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="bg-accent">
                      <TableCell>
                        <div className="font-medium">
                          {order.shippingAddress?.name}
                        </div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {order.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusDropdown
                          id={order.id}
                          orderStatus={order.status}
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {order.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(order.amount / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
