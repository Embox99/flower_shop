import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";
import Providers from "./providers";

const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter_Tight({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "A small flower studio in Florentin, Tel Aviv. Cut at first light, delivered the same afternoon.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Flower Shop — hand-tied in Tel Aviv",
    template: "%s · Flower Shop",
  },
  description,
  openGraph: {
    siteName: "Flower Shop",
    title: "Flower Shop — hand-tied in Tel Aviv",
    description,
    type: "website",
    images: ["/images/main_preview.png"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">
        <a href="#main" className="fs-skip-link">Skip to content</a>
        <Providers>
          <Banner />
          <Navbar />
          <div id="main">{children}</div>
          <Footer />
          <CartDrawer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
