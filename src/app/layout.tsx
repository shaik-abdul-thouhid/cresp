import "~/styles/globals.css";

import type { Metadata } from "next";
import { Dancing_Script, Geist, Inter } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "~/components/providers/query-provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Cresp - Showcase, Recognition, Collaboration",
	description:
		"A creative social media platform for directors, actors, writers, singers, photographers, and all creative professionals. Showcase your work, gain recognition, and collaborate on amazing projects.",
	keywords: [
		"creative platform",
		"social media for creatives",
		"showcase work",
		"creative collaboration",
		"directors",
		"actors",
		"writers",
		"singers",
		"photographers",
		"video editors",
	],
	authors: [{ name: "Cresp" }],
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Cresp",
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		title: "Cresp - Where Creativity Meets Collaboration",
		description:
			"Join the creative community. Showcase your work, gain recognition, and collaborate with other professionals.",
		type: "website",
		siteName: "Cresp",
		images: [
			{
				url: "/images/cresp.png",
				width: 1200,
				height: 630,
				alt: "Cresp - Creative Social Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Cresp - Creative Social Platform",
		description:
			"Showcase your work, gain recognition, and collaborate with creative professionals.",
		images: ["/images/cresp.png"],
	},
	icons: [
		{ rel: "icon", url: "/images/sp.png" },
		{ rel: "apple-touch-icon", url: "/images/sp.png" },
		{ rel: "icon", url: "/images/sp.svg", type: "image/svg+xml" },
	],
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 5,
		userScalable: true,
		viewportFit: "cover",
	},
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
		{ media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
	],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const dancingScript = Dancing_Script({
	subsets: ["latin"],
	variable: "--font-dancing-script",
	weight: ["400", "700"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			className={`${geist.variable} ${inter.variable} ${dancingScript.variable}`}
		>
			<head>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Cresp" />
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body className="antialiased">
				<QueryProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</QueryProvider>
				<Toaster
					position="top-center"
					theme="light"
					toastOptions={{
						style: {
							background: "white",
							border: "1px solid #e5e7eb",
							color: "#1f2937",
							boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
						},
						className: "font-medium",
					}}
					richColors
				/>
			</body>
		</html>
	);
}
