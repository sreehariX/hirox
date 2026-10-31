import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Hirox · Founder intelligence",description:"Research founders, companies, and independent builders. Understand the evidence, evaluate thesis fit, and draft a relevant introduction."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
