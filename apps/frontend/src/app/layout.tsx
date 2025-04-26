"use client";

import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans bg-powder`}>
        <AuthProvider>
          <InnerLayout>{children}</InnerLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const [modal, setModal] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>{" "}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {modal === "login" && (
          <LoginModal onSwitch={() => setModal("register")} />
        )}
        {modal === "register" && (
          <RegisterModal onSwitch={() => setModal("login")} />
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex justify-center mt-6">
        <aside className="w-1/6 hidden lg:block" />
        <main className="w-4/6 max-w-[1200px]">{children}</main>
        <aside className="w-1/6 hidden lg:block" />
      </div>
    </>
  );
}
