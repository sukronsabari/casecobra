"use client";

import NextImage from "next/image";
import { useState, useRef, Fragment } from "react";
import { Rnd } from "react-rnd";
import { ArrowRight } from "lucide-react";
import { RadioGroup, Radio } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import {
  PhoneColor,
  PhoneFinishes,
  PhoneMaterial,
  PhoneModel,
} from "@prisma/client";

import { base64ToBlob, formatPrice } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";

import { HandleComponent } from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { VariantSelectorGroup } from "./VariantSelectorGroup";
import { ModelSelector } from "./ModelSelector";
import { savePhoneConfiguration } from "./actions";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

type PhoneModelWithVariants = PhoneModel & {
  phoneColors: PhoneColor[];
  phoneMaterials: PhoneMaterial[];
  phoneFinishes: PhoneFinishes[];
};

interface DesignConfiguratorProps {
  imageConfigId: string;
  imageConfigUrl: string;
  imageConfigDimension: { width: number; height: number };
  phoneModels: PhoneModelWithVariants[];
}
export function DesignConfigurator({
  imageConfigId,
  imageConfigUrl,
  imageConfigDimension,
  phoneModels,
}: DesignConfiguratorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedModel, setSelectedModel] = useState(phoneModels[0]);
  const [selectedColor, setSelectedColor] = useState<PhoneColor>(
    phoneModels[0].phoneColors[0]
  );
  const [selectedMaterial, setSelectedMaterial] = useState<PhoneMaterial>(
    phoneModels[0].phoneMaterials[0]
  );
  const [selectedFinish, setSelectedFinish] = useState<PhoneFinishes>(
    phoneModels[0].phoneFinishes[0]
  );

  const handleModelChange = (modelId: string) => {
    const findPhoneModel = phoneModels.find((model) => model.id === modelId);

    if (!findPhoneModel) return;
    setSelectedModel(findPhoneModel);
    setSelectedColor(findPhoneModel.phoneColors[0]);
    setSelectedMaterial(findPhoneModel.phoneMaterials[0]);
    setSelectedFinish(findPhoneModel.phoneFinishes[0]);
  };

  const handleFinishChange = (finishId: string) => {
    const findFinish = selectedModel.phoneFinishes.find(
      (finish) => finish.id === finishId
    );

    if (!findFinish) return;
    setSelectedFinish(findFinish);
  };

  const handleMaterialChange = (materialId: string) => {
    const findMaterial = selectedModel.phoneMaterials.find(
      (material) => material.id === materialId
    );

    if (!findMaterial) return;
    setSelectedMaterial(findMaterial);
  };

  const [renderedDimension, setRenderedDimension] = useState({
    width: imageConfigDimension.width / 4,
    height: imageConfigDimension.height / 4,
  });

  const [renderedPosition, setRenderedPosition] = useState({
    x: 150,
    y: 205,
  });

  const phoneCaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startUpload } = useUploadThing("imageUploader");

  const { mutate, isPending } = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async () => {
      const [_, phoneConfigId] = await Promise.all([
        saveImageConfiguration(),
        savePhoneConfiguration({
          modelId: selectedModel.id,
          imageConfigId,
          colorId: selectedColor.id,
          materialId: selectedMaterial.id,
          finishId: selectedFinish.id,
        }),
      ]);

      return phoneConfigId;
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description:
          error.message || "There was an error on our end. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (phoneConfigId) => {
      router.push(`/configure/preview?phoneConfigId=${phoneConfigId}`);
    },
  });

  async function saveImageConfiguration() {
    try {
      const {
        left: caseLeft,
        top: caseTop,
        width,
        height,
      } = phoneCaseRef.current!.getBoundingClientRect();

      const { left: containerLeft, top: containerTop } =
        containerRef.current!.getBoundingClientRect();

      const leftOffset = caseLeft - containerLeft;
      const topOffset = caseTop - containerTop;

      const actualX = renderedPosition.x - leftOffset;
      const actualY = renderedPosition.y - topOffset;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const userImage = new Image();
      userImage.crossOrigin = "anonymous";
      userImage.src = imageConfigUrl;
      await new Promise((resolve) => (userImage.onload = resolve));

      ctx?.drawImage(
        userImage,
        actualX,
        actualY,
        renderedDimension.width,
        renderedDimension.height
      );

      // convert canvas (with rendered image) to base64 string
      const base64 = canvas.toDataURL();
      const base64Data = base64.split(",")[1];

      // convert base64 image to blob (image)
      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "filename.png", { type: "image/png" });

      await startUpload([file], { imageConfigId });
    } catch (error) {
      toast({
        title: "Ups! something wen't wrong",
        description:
          "There was a problem saving your config, please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20">
      <div
        ref={containerRef}
        className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
          <AspectRatio
            ref={phoneCaseRef}
            ratio={896 / 1831}
            className="pointer-events-none relative z-50 aspect-[896/1831] w-full"
          >
            <NextImage
              src="/images/phone-template.png"
              alt="phone image"
              className="pointer-events-none z-50 select-none"
              fill
            />
          </AspectRatio>
          {/* shadow and overlays out of phone like transparent */}
          <div className="absolute z-40 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
          {/* case color */}
          <div
            className="absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]"
            style={{ backgroundColor: `${selectedColor.hex}` }}
          />
        </div>
        <Rnd
          default={{
            x: 150,
            y: 205,
            height: imageConfigDimension.height / 4,
            width: imageConfigDimension.width / 4,
          }}
          lockAspectRatio
          rot
          resizeHandleComponent={{
            bottomRight: <HandleComponent />,
            bottomLeft: <HandleComponent />,
            topRight: <HandleComponent />,
            topLeft: <HandleComponent />,
          }}
          className="absolute z-20"
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            setRenderedDimension({
              // 50px, get the number only
              height: parseInt(ref.style.height.slice(0, -2)),
              width: parseInt(ref.style.width.slice(0, -2)),
            });

            setRenderedPosition({ x, y });
          }}
          onDragStop={(_, data) => {
            const { x, y } = data;
            setRenderedPosition({ x, y });
          }}
        >
          <div className="relative w-full h-full">
            <NextImage
              src={imageConfigUrl}
              fill
              alt="your image"
              className="pointer-events-none"
            />
          </div>
        </Rnd>
      </div>
      <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          <div
            aria-hidden
            className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"
          />

          <div className="px-8 pb-12 pt-8">
            <h2 className="tracking-tight font-bold text-3xl">
              Costumize your case
            </h2>

            <div className="w-full h-px bg-gray-300 my-6" />
            <div className="relative mt-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={selectedColor}
                  onChange={(color) => setSelectedColor(color)}
                >
                  <Label>Color: {selectedColor.name}</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {selectedModel.phoneColors.map((color) => {
                      return (
                        <Radio as={Fragment} key={color.id} value={color}>
                          {({ checked, disabled }) => (
                            <div
                              className="relative -m-0.5 flex items-center justify-center cursor-pointer rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2"
                              style={{
                                borderColor: checked
                                  ? `${color.hex}`
                                  : "transparent",
                              }}
                            >
                              <span
                                className={`h-8 w-8 rounded-full border border-black border-opacity-10 bg-[${color.hex}]`}
                                style={{ backgroundColor: `${color.hex}` }}
                              />
                            </div>
                          )}
                        </Radio>
                      );
                    })}
                  </div>
                </RadioGroup>

                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Model: </Label>
                  <ModelSelector
                    phoneModels={phoneModels}
                    handleModelChange={handleModelChange}
                    selectedModel={selectedModel}
                  />
                </div>

                <VariantSelectorGroup
                  key="material_selector"
                  label="material"
                  selectedValue={selectedMaterial}
                  onChange={(materialId) => handleMaterialChange(materialId)}
                  optionsData={selectedModel.phoneMaterials}
                />

                <VariantSelectorGroup
                  key="finishing_selector"
                  label="finishing"
                  selectedValue={selectedFinish}
                  onChange={(finishId) => handleFinishChange(finishId)}
                  optionsData={selectedModel.phoneFinishes}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />

          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap">
                {formatPrice(
                  (selectedModel.price +
                    selectedMaterial.price +
                    selectedFinish.price) /
                    100
                )}
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => mutate()}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
