"use server";

import { prisma } from "@/lib/db";
import { IApiResponse } from "@/types/api-response";

export interface SaveUserConfig {
  colorId: string;
  finishId: string;
  materialId: string;
  modelId: string;
  imageConfigId: string;
}
export async function savePhoneConfiguration({
  colorId,
  finishId,
  materialId,
  modelId,
  imageConfigId,
}: SaveUserConfig): Promise<string> {
  const phoneModel = await prisma.phoneModel.findUnique({
    where: {
      id: modelId,
    },
    include: {
      phoneColors: { where: { id: colorId } },
      phoneMaterials: { where: { id: materialId } },
      phoneFinishes: { where: { id: finishId } },
    },
  });

  if (!phoneModel) {
    throw new Error(
      "Cannot find phone model, please select different phone model!"
    );
  }

  const { phoneColors, phoneFinishes, phoneMaterials } = phoneModel;
  if (!phoneColors.length || !phoneFinishes.length || !phoneMaterials.length) {
    throw new Error(
      "Cannot find phone properties, please re-select case color, material, and finishing!"
    );
  }

  const findImageConfig = await prisma.imageConfiguration.findUnique({
    where: { id: imageConfigId },
  });

  if (!findImageConfig) {
    throw new Error(
      "Cannot find image, please try again or reupload your image!"
    );
  }

  const phoneConfig = await prisma.phoneConfiguration.create({
    data: {
      imageConfigurationId: imageConfigId,
      phoneModelId: modelId,
      phoneColorId: colorId,
      phoneMaterialId: materialId,
      phoneFinishId: finishId,
    },
  });

  return phoneConfig.id;
}
