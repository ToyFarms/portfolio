import "@/app/styles/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Metadata } from "next";
import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Chat from "@/components/chat";

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
    <html lang="en" suppressHydrationWarning>
      <body className="mx-5 sm:mx-10 md:mx-15 mt-8">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-[100vh] relative z-10">
            <Header />
            <main>{children}</main>
          </div>
          <Footer />
          <Chat />
        </ThemeProvider>
      </body>
    </html>
  );
}
