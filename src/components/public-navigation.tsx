import Image from "next/image";
import Link from "next/link";

export function PublicNavigation() {
	return (
		<nav className="border-gray-200 border-b bg-white shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/feed" className="flex items-center gap-3">
						<div className="relative h-10 w-25">
							<Image
								src="/images/cresp.png"
								alt="Cresp"
								fill
								className="object"
							/>
						</div>
					</Link>

					{/* Auth CTAs */}
					<div className="flex items-center gap-3">
						<Link
							href="/login"
							className="rounded-lg px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
						>
							Log in
						</Link>
						<Link
							href="/signup"
							className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-sm text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Sign up
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
