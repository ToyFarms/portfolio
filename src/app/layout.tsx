import "@/app/styles/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-5 sm:mx-10 md:mx-15 mt-8">
        <div className="min-h-[100vh]">
          <Header />
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
