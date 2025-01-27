import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RSM Sustainability AI Assistant",
  description: "IFRS S1 & S2 for GCC Businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link rel="icon" href="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Favicon_1f31b4ff-e7cf-44eb-8240-8be4de3bdcfd.png" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
