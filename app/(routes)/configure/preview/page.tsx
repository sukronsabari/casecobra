import getSession from "@/lib/getSession";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DesignPreview } from "./DesignPreview";

interface PreviewPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const phoneConfigId = searchParams?.phoneConfigId as string;

  if (!phoneConfigId) {
    notFound();
  }

  const phoneConfiguration = await prisma.phoneConfiguration.findUnique({
    where: {
      id: phoneConfigId,
    },
    include: {
      imageConfiguration: true,
      phoneColor: true,
      phoneModel: true,
      phoneFinish: true,
      phoneMaterial: true,
    },
  });

  if (!phoneConfiguration) {
    notFound();
  }

  return <DesignPreview phoneConfiguration={phoneConfiguration} />;
}
