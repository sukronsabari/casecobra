"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "./actions";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PhonePreview } from "@/components/PhonePreview";
import { formatPrice } from "@/lib/utils";
import { Phone } from "@/components/Phone";

export function ThankYou() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const { data } = useQuery({
    queryKey: ["get-payment-status"],
    queryFn: async () => await getPaymentStatus({ orderId }),
    retry: true,
    retryDelay: 500,
  });

  const SHIPPING_AMOUNT = 500;

  if (data === undefined) {
    return (
      <div className="min-h-screen">
        <div className="w-full mt-24 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            <h3 className="font-semibold text-xl">Loading your order...</h3>
            <p>This won&apos;t take long.</p>
          </div>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen">
        <div className="w-full mt-24 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            <h3 className="font-semibold text-xl">
              Verifiying your payment...
            </h3>
            <p>This might take a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  const { phoneConfiguration, billingAddress, shippingAddress, amount } = data!;
  console.log("DEBUG", data);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl">
          <p className="text-base font-medium text-primary">Thank you!</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Your case is on the way!
          </h1>
          <p className="mt-2 text-base text-zinc-500">
            We&apos;ve received your order and are now processing it.
          </p>

          <div className="mt-12 text-sm font-medium">
            <p className="text-zinc-900">Order number</p>
            <p className="mt-2 text-zinc-500">{orderId}</p>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200">
          <div className="mt-10 flex flex-auto flex-col">
            <h4 className="font-semibold text-zinc-900">
              You made a great choice!
            </h4>
            <p className="mt-2 text-sm text-zinc-600">
              We at CaseCobra believe that a phone case doesn&apos;t only need
              to look good, but also last you for the years to come. We offer a
              5-year print guarantee: If you case isn&apos;t of the highest
              quality, we&apos;ll replace it for free.
            </p>
          </div>
        </div>

        <div className="mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div>
            <Phone
              imgSrc={phoneConfiguration.imageConfiguration.croppedImageUrl!}
              style={{ backgroundColor: phoneConfiguration.phoneColor.hex }}
              className="w-60"
            />
          </div>

          <div>
            <div className="grid grid-cols-2 gap-x-6 py-10 text-sm">
              <div>
                <p className="font-medium text-gray-900">Shipping address</p>
                <div className="mt-2 text-zinc-700">
                  <address className="not-italic">
                    <span className="block">{shippingAddress?.name}</span>
                    <span className="block">{shippingAddress?.street}</span>
                    <span className="block">
                      {shippingAddress?.postalCode} {shippingAddress?.city}
                    </span>
                  </address>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Billing address</p>
                <div className="mt-2 text-zinc-700">
                  <address className="not-italic">
                    <span className="block">{billingAddress?.name}</span>
                    <span className="block">{billingAddress?.street}</span>
                    <span className="block">
                      {billingAddress?.postalCode} {billingAddress?.city}
                    </span>
                  </address>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm">
              <div>
                <p className="font-medium text-zinc-900">Payment status</p>
                <p className="mt-2 text-zinc-700">Paid</p>
              </div>

              <div>
                <p className="font-medium text-zinc-900">Shipping Method</p>
                <p className="mt-2 text-zinc-700">
                  DHL, takes up to 3 working days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-zinc-200 pt-10 text-sm">
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Subtotal</p>
            <p className="text-zinc-700">{formatPrice(amount / 100)}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Shipping</p>
            <p className="text-zinc-700">
              {formatPrice(SHIPPING_AMOUNT / 100)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-zinc-900">Total</p>
            <p className="text-zinc-700">
              {formatPrice(amount / 100 + SHIPPING_AMOUNT / 100)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
