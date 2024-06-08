/* eslint-disable @next/next/no-img-element */
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
import {
  ImageConfiguration,
  Order,
  PhoneConfiguration,
  ShippingAddress,
  User,
} from "@prisma/client";
import { StatusDropdown } from "./StatusDropdown";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";

type OrderProps = ({
  user: User;
  shippingAddress: ShippingAddress | null;
  phoneConfiguration: {
    imageConfiguration: ImageConfiguration;
  } & PhoneConfiguration;
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
  async function handleDownload(url: string, filename: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const contentType = response.headers.get("Content-Type");
      const extension = contentType ? contentType.split("/").pop() : "";
      const fullFilename = `${filename}.${extension}`;

      const ancorUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");

      link.href = ancorUrl;
      link.setAttribute("download", fullFilename);
      document.body.appendChild(link);
      link.click();
      link?.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Gagal mengunduh file:", err);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex flex-col min-h-screen w-full bg-muted/40 max-w-7xl mx-auto">
        <div className="pt-8 grid gap-4 sm:grid-cols-2 max-w-7xl px-8">
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
        <div className="mt-16">
          <h1 className="text-4xl font-bold tracking-tight mx-8 mb-4">
            Incoming orders
          </h1>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Purchase date
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">File</TableHead>
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
                    <StatusDropdown id={order.id} orderStatus={order.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.amount / 100)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Button
                      variant="link"
                      className="text-blue-500 px-0"
                      onClick={() =>
                        handleDownload(
                          order.phoneConfiguration!.imageConfiguration!
                            .croppedImageUrl!,
                          `image-${new Date().getTime()}`
                        )
                      }
                    >
                      Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
