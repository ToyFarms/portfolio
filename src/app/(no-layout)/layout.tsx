import "@/app/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="en" suppressHydrationWarning>
      <body className="mx-5 sm:mx-10 md:mx-15 mt-8">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-[100vh] relative">
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
