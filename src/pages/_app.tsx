import "@/styles/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <div className="mx-5 sm:mx-10 md:mx-15 mt-8">
        <div className="min-h-[100vh]">
          <Header />
          <main>
            <Component {...pageProps} />
          </main>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}
