import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

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
          <Header />
          <div className="flex justify-center mt-6">
            <aside className="w-1/6 hidden lg:block" />

            <main className="w-4/6 max-w-[1200px]">{children}</main>

            <aside className="w-1/6 hidden lg:block" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
