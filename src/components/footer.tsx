import Link from "next/link";

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
						<Link
							href="/terms"
							className="text-gray-600 transition-colors hover:text-gray-900"
						>
							Terms of Service
						</Link>
						<Link
							href="/privacy-policy"
							className="text-gray-600 transition-colors hover:text-gray-900"
						>
							Privacy Policy
						</Link>
					</div>

					{/* Prototype Notice */}
					<p className="text-center text-gray-500 text-xs">Prototype Version</p>
				</div>
			</div>
		</footer>
	);
}
