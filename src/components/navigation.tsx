import Image from "next/image";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";

interface NavigationUser {
	id: string;
	username: string;
	email: string;
	name?: string | null;
	image?: string | null;
}

const NAV_LINKS = [
	{ href: "/feed", icon: "🏠", label: "Feed" },
	{ href: "/discover", icon: "🔍", label: "Discover" },
	{ href: "/collaborations", icon: "🤝", label: "Collaborations" },
	{ href: "/messages", icon: "💬", label: "Messages" },
] as const;

export function Navigation({ user }: { user: NavigationUser }) {
	return (
		<nav className="border-gray-200 border-b bg-white shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo and Brand */}
					<div className="flex items-center gap-8">
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

						{/* Main Navigation Links */}
						<div className="hidden space-x-4 md:flex">
							{NAV_LINKS.map((link) => (
								<NavLink key={link.href} href={link.href} icon={link.icon}>
									{link.label}
								</NavLink>
							))}
						</div>
					</div>

					{/* User Menu */}
					<div className="flex items-center gap-4">
						<button
							type="button"
							className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-sm text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Create Post
						</button>

						<UserDropdown
							userId={user.id}
							name={user.name}
							image={user.image}
						/>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className="safe-area-bottom fixed right-0 bottom-0 left-0 z-40 border-gray-200 border-t bg-white shadow-lg md:hidden">
				<div className="flex justify-around py-2">
					{NAV_LINKS.map((link) => (
						<MobileNavLink key={link.href} href={link.href} icon={link.icon} />
					))}
				</div>
			</div>
		</nav>
	);
}

function NavLink({
	href,
	icon,
	children,
}: {
	href: string;
	icon: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
		>
			<span>{icon}</span>
			<span>{children}</span>
		</Link>
	);
}

function MobileNavLink({ href, icon }: { href: string; icon: string }) {
	return (
		<Link
			href={href}
			className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
		>
			<span className="text-xl">{icon}</span>
		</Link>
	);
}
