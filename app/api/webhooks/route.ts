import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { render } from "@react-email/render";
import { OrderReceivedEmail } from "@/components/emails/OrderReceivedEmail";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new Response("invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      const session = event.data.object as Stripe.Checkout.Session;

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      const billingAddress = session.customer_details!.address;
      const shippingAddress = session.shipping_details!.address;

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAddress!.country!,
              country: shippingAddress!.country!,
              street: shippingAddress!.line1!,
              state: shippingAddress!.state,
              postalCode: shippingAddress!.postal_code!,
            },
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.country!,
              country: billingAddress!.country!,
              street: billingAddress!.line1!,
              state: billingAddress!.state,
              postalCode: billingAddress!.postal_code!,
            },
          },
        },
        include: {
          shippingAddress: true,
        },
      });

      const emailHtml = render(
        OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: updatedOrder.shippingAddress!,
        })
      );

      await sendMail({
        to: event.data.object.customer_details.email,
        subject: "Thanks for your order!",
        content: emailHtml,
      });
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong", ok: false },
      { status: 500 }
    );
  }
}
