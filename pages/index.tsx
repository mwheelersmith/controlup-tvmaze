import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

import Search from "@/components/search";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col w-sm mx-auto mt-32">
        <Search />
      </main>
    </div>
  );
}
