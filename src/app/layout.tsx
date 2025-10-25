import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoicer - Invoice Management",
  description: "Create and manage invoices for companies and individuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
