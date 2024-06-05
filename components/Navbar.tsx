"use client";

import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { signOut, useSession, getSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/SectionWrapper";
import { useEffect, useState } from "react";
import { LoginModal } from "./LoginModal";
import { useSearchParams } from "next/navigation";

export function Navbar() {
  const session = useSession();
  const user = session?.data?.user;
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (callbackUrl && !user) {
      setOpenModal(true);
    }
  }, [callbackUrl, user]);

  return (
    <nav className="sticky z-[99999] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <SectionWrapper>
        <div className="h-full flex items-center justify-between">
          <Link href="/" className="font-semibold">
            case
            <span className="text-primary">cobra</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Logout
                </Button>
                {user.role === "ADMIN" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">Dashboard 🚀</Link>
                  </Button>
                )}
              </>
            )}

            {!user && session.status !== "loading" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenModal(true)}
              >
                <>
                  <LogIn className="w-4 h-4 inline mr-1.5" />
                  Login
                </>
              </Button>
            )}

            <LoginModal
              callbackUrl={callbackUrl}
              title="Login"
              description="to order your custom case"
              isOpen={openModal}
              setIsOpen={setOpenModal}
            />

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <Button
              variant="default"
              size="sm"
              className="hidden sm:inline-flex text-white"
              asChild
            >
              <Link href="/configure/upload" className="flex">
                <span className="mr-px">Create case</span>
                <ArrowRight size={24} />
              </Link>
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </nav>
  );
}
