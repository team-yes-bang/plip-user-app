import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Gothic_A1, Inter, Manrope, Montserrat, Poppins, Geist } from "next/font/google";
import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { VideoViewerProvider } from "@/components/providers/VideoViewerProvider";
import { AppRouteShell } from "@/components/templates/AppRouteShell";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const gothicA1 = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PLIP",
  description: "PLIP — Personal Clip",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="ko"
      className={cn("h-dvh overflow-hidden overscroll-none", "antialiased", poppins.variable, gothicA1.variable, montserrat.variable, manrope.variable, geistMono.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="flex h-dvh min-h-0 flex-col overflow-hidden overscroll-none">
        <AuthSessionProvider isLoggedIn={session?.isLoggedIn === true} session={session}>
          <VideoViewerProvider>
            <AppRouteShell>{children}</AppRouteShell>
          </VideoViewerProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
