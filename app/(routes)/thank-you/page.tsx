import { Suspense } from "react";
import { ThankYou } from "./ThankYou";

export default async function ThankYouPage() {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
}
