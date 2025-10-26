import { Camera, Clapperboard, Music, Theater } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="-left-4 absolute top-0 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl" />
				<div className="animation-delay-2000 -right-4 absolute top-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl" />
				<div className="animation-delay-4000 absolute bottom-0 left-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500 opacity-20 blur-3xl" />
			</div>

			{/* Main content - horizontal layout with logo on left */}
			<div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-12 lg:px-12 lg:py-0">
				{/* Logo - common for all auth pages - vertically centered */}
				<div className="flex shrink-0 items-center justify-start lg:w-96 lg:self-center">
					<div className="relative h-32 w-32 lg:h-56 lg:w-56">
						<Image
							src="/images/cresp.svg"
							alt="Cresp Logo"
							fill
							className="object-contain brightness-0 invert"
							priority
						/>
					</div>
				</div>

				{/* Page-specific content */}
				<div className="w-full max-w-md lg:my-auto">{children}</div>
			</div>

			{/* Decorative elements */}
			<div className="pointer-events-none absolute inset-0">
				<Clapperboard className="absolute top-20 left-10 h-16 w-16 text-purple-500/20" />
				<Theater className="absolute top-40 right-10 h-16 w-16 text-pink-500/20" />
				<Music className="absolute bottom-20 left-20 h-16 w-16 text-indigo-500/20" />
				<Camera className="absolute right-20 bottom-40 h-16 w-16 text-purple-500/20" />
			</div>
		</div>
	);
}
