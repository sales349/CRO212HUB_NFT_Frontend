"use client";

import "./globals.css";
import { AppKitProvider } from "../context/AppKitProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>CRO212 NFT Mint</title>
        <meta name="description" content="NFT Minting on Cronos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
