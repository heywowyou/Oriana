import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "../../components/Header";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
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
        <Header />
        {children}
      </body>
    </html>
  );
}
