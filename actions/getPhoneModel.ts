"use server";

import { prisma } from "@/lib/db";

export async function getPhoneConfiguration() {
  const phoneModels = await prisma.phoneModel.findMany({
    include: { phoneColors: true, phoneMaterials: true, phoneFinishes: true },
  });

  console.log("Phone models", phoneModels);
  return phoneModels;
}
