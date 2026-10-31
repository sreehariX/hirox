import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Hirox · Founder intelligence",description:"Discover the people worth a conversation. Evidence-led venture research and thoughtful outreach."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
