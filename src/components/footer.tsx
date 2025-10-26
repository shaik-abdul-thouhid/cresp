import Link from "next/link";

const FOOTER_LINKS = [
	{ href: "/terms", label: "Terms of Service" },
	{ href: "/privacy-policy", label: "Privacy Policy" },
] as const;

export function Footer() {
	return (
		<footer className="border-gray-200 border-t bg-white py-6">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					{/* Copyright */}
					<p className="text-center text-gray-600 text-sm">
						© {new Date().getFullYear()} Cresp. All rights reserved.
					</p>

					{/* Links */}
					<div className="flex gap-6 text-sm">
						{FOOTER_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-gray-600 transition-colors hover:text-gray-900"
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* Prototype Notice */}
					<p className="text-center text-gray-500 text-xs">Prototype Version</p>
				</div>
			</div>
		</footer>
	);
}
