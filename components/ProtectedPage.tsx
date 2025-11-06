"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      // Not logged in, redirect to login page
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-accent text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
