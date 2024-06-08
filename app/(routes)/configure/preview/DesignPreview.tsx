"use client";

import Confetti from "react-dom-confetti";
import {
  ImageConfiguration,
  PhoneColor,
  PhoneConfiguration,
  PhoneFinishes,
  PhoneMaterial,
  PhoneModel,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { Phone } from "@/components/Phone";
import { ArrowRight, Check } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { AuthenticationError } from "@/lib/exceptions";
import { useSession } from "next-auth/react";
import { LoginModal } from "@/components/LoginModal";
import { Spinner } from "@/components/Spinner";

type PhoneConfigurationWithImage = PhoneConfiguration & {
  imageConfiguration: ImageConfiguration;
  phoneModel: PhoneModel;
  phoneMaterial: PhoneMaterial;
  phoneFinish: PhoneFinishes;
  phoneColor: PhoneColor;
};

interface DesignPreviewProps {
  phoneConfiguration: PhoneConfigurationWithImage;
}

export function DesignPreview({ phoneConfiguration }: DesignPreviewProps) {
  const router = useRouter();
  const session = useSession();

  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const {
    imageConfiguration,
    phoneModel,
    phoneColor,
    phoneMaterial,
    phoneFinish,
  } = phoneConfiguration;
  const totalPrice = phoneModel.price + phoneMaterial.price + phoneFinish.price;

  const { mutate: createPaymentSession, isPending } = useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) {
        router.push(url);
      } else {
        throw new Error("Unable to retrieve payment URL.");
      }
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description:
          error.message || "There was an error on our end. Please try again.",
        variant: "destructive",
      });

      if (error instanceof AuthenticationError) {
        setTimeout(() => {
          router.push(
            `/auth/login?callbackUrl=/configure/preview?phoneConfigId=${phoneConfiguration.id}`
          );
        }, 2000);
      }
    },
  });

  const handleCheckout = () => {
    if (session.data?.user) {
      createPaymentSession({ phoneConfigId: phoneConfiguration.id });
    } else {
      localStorage.setItem("phoneConfigId", phoneConfiguration.id);
      setOpenLoginModal(true);
    }
  };

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
      >
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <LoginModal
        callbackUrl={`/configure/preview?phoneConfigId=${phoneConfiguration.id}`}
        title="Login to continue"
        description="Your configuration was saved! Please login to complete your purchase"
        isOpen={openLoginModal}
        setIsOpen={setOpenLoginModal}
      />

      <div className="mt-20 px-4 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
        <div>
          <Phone
            imgSrc={imageConfiguration.croppedImageUrl!}
            style={{ backgroundColor: phoneColor.hex }}
            className="w-60"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Your {phoneModel.name} Case
          </h3>

          <div className="mt-3 flex items-center gap-1 5 text-base">
            <Check className="w-4 h-4 text-teal-600" />
            In stock and ready to ship
          </div>

          <div className="text-base">
            <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:grid-cols-1 lg:grid-cols-2">
              <div>
                <p className="font-medium text-zinc-950">Highlights</p>
                <ol className="mt-3 text-zinc-700 list-disc list-inside">
                  <li>Wireless charging compatible</li>
                  <li>TPU shock absorption</li>
                  <li>Packaging made from recycled materials</li>
                  <li>5 year print warranty</li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-zinc-950">Materials</p>
                <ol className="mt-3 text-zinc-700 list-disc list-inside">
                  <li>High-quality, durable material</li>
                  <li>Scratch- and fingerprint resistant coating</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-gray-50 p-6 sm:p-8">
              <div className="flow-root text-sm">
                <div className="flex items-center justify-between py-1 mt-2">
                  <div className="text-gray-600 capitalize">Base price</div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(phoneModel.price / 100)}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 mt-2">
                  <div className="text-gray-600 capitalize">
                    {phoneMaterial.name} material
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(phoneMaterial.price / 100)}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 mt-2">
                  <div className="text-gray-600 capitalize">
                    {phoneFinish.name} finishing
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(phoneFinish.price / 100)}
                  </div>
                </div>

                <div className="my-2 h-px bg-gray-200" />

                <div className="flex items-center justify-between py-2">
                  <p className="font-semibold text-gray-900">Order Total</p>
                  <div className="font-semibold text-gray-900">
                    {formatPrice(totalPrice / 100)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pb-12">
              <Button
                onClick={handleCheckout}
                className="px-4 bg-teal-600 hover:bg-teal-600/90 m:px-6 lg:px-8 min-w-[120px]"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner />
                  </>
                ) : (
                  <>
                    Checkout <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
