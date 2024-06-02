import getSession from "@/lib/getSession";
import { UploadForm } from "./UploadPage";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  return <UploadForm />;
}
