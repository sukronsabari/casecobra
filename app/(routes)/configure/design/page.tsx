import { notFound, redirect } from "next/navigation";
import { DesignConfigurator } from "./DesignConfigurator";
import { prisma } from "@/lib/db";
import { getPhoneConfiguration } from "@/actions/getPhoneModel";

interface DesignPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function DesignPage({ searchParams }: DesignPageProps) {
  const imageConfigId = searchParams?.imageConfigId as string;

  if (!imageConfigId) {
    notFound();
  }

  const imageConfiguration = await prisma.imageConfiguration.findUnique({
    where: {
      id: imageConfigId,
    },
  });

  if (!imageConfiguration) {
    notFound();
  }

  const phoneModels = await getPhoneConfiguration();

  return (
    <DesignConfigurator
      imageConfigId={imageConfigId}
      imageConfigUrl={imageConfiguration.url}
      imageConfigDimension={{
        width: imageConfiguration.width,
        height: imageConfiguration.height,
      }}
      phoneModels={phoneModels}
    />
  );
}
