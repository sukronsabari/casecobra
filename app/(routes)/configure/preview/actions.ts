"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AuthenticationError } from "@/lib/exceptions";
import { stripe } from "@/lib/stripe";
import { Order } from "@prisma/client";

export async function createCheckoutSession({
  phoneConfigId,
}: {
  phoneConfigId: string;
}) {
  const session = await auth();

  if (!session?.user.id) {
    throw new AuthenticationError("Your need to be logged in! Redirecting...");
  }

  const phoneConfiguration = await prisma.phoneConfiguration.findUnique({
    where: { id: phoneConfigId },
    include: {
      imageConfiguration: true,
      phoneMaterial: true,
      phoneModel: true,
      phoneFinish: true,
    },
  });

  if (!phoneConfiguration) {
    throw new Error("No such configuration found");
  }

  const { phoneMaterial, phoneModel, phoneFinish, imageConfiguration } =
    phoneConfiguration;

  if (!phoneMaterial || !phoneModel || !phoneFinish || !imageConfiguration) {
    throw new Error(
      "No such configuration found, please check your selected color, material, and finishing case!"
    );
  }

  const totalPriceInCents =
    phoneMaterial.price + phoneModel.price + phoneFinish.price;

  let order: Order | undefined;

  const existingOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      phoneConfigurationId: phoneConfigId,
    },
  });

  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await prisma.order.create({
      data: {
        amount: totalPriceInCents,
        userId: session.user.id,
        phoneConfigurationId: phoneConfigId,
      },
    });
  }

  const product = await stripe.products.create({
    name: `Custom ${phoneConfiguration.phoneModel.name} case`,
    images: [phoneConfiguration.imageConfiguration.croppedImageUrl as string],
    default_price_data: {
      currency: "USD",
      unit_amount: totalPriceInCents,
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?phoneConfigId=${phoneConfigId}`,
    payment_method_types: ["card"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["US", "SG", "ID"] },
    metadata: {
      userId: session.user.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  return { url: stripeSession.url };
}
