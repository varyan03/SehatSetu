import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata = {
  title: "SehatSetu",
  description: "Your modern healthcare platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.variable} antialiased`} style={{ fontFamily: 'var(--font-lexend), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
