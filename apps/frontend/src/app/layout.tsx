import "./globals.css";
import Header from "../../components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-powder">
        <Header />
        {children}
      </body>
    </html>
  );
}
