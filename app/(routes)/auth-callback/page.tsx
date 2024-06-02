"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [phoneConfigId, setPhoneConfigId] = useState<string | null>(null);

  useEffect(() => {
    const configId = localStorage.getItem("phoneConfigId");
    if (configId) setPhoneConfigId(configId);
  }, []);

  const {} = useQuery({
    queryKey: ["auth-callback"],
    queryFn: async () => {},
  });
}
