"use client";

import { Roboto } from "next/font/google";
import "./globals.css"; // For Tailwind base/components/utilities and other global styles
import Header from "@/components/Header";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
// We no longer need to import GrainOverlay
// import GrainOverlay from "@/components/GrainOverlay";

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
    <html lang="en" className="h-full">
      <body
        className={`${roboto.variable} font-sans min-h-screen flex flex-col`}
        style={{
          // Set the background image using the URL from your `public` folder
          backgroundImage: `url('/images/black-grain-10.jpg')`,

          // This achieves the "fixed when scrolling" effect
          backgroundAttachment: "fixed",

          // This ensures the image scales to cover the entire viewport without distortion
          backgroundSize: "cover",

          // This keeps the center of the image visible, which is best for responsiveness
          backgroundPosition: "center center",

          // This prevents the image from tiling if the content is larger than the viewport
          backgroundRepeat: "no-repeat",
        }}
      >
        <AuthProvider>
          <InnerLayout>{children}</InnerLayout>
        </AuthProvider>
        {/* The GrainOverlay component is no longer needed here */}
      </body>
    </html>
  );
}

// InnerLayout function remains the same as you provided earlier
function InnerLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const [modal, setModal] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex justify-center mt-6 flex-grow">
        <aside className="w-1/6 hidden lg:block" />
        <main className="relative w-4/6 max-w-[1200px]">{children}</main>
        <aside className="w-1/6 hidden lg:block" />
      </div>
    </div>
  );
}
