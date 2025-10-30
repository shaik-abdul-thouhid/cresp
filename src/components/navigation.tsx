"use client";

import { Compass, FileText, Home, MessageSquare, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "./user-dropdown";

interface NavigationUser {
	id: string;
	username: string;
	email: string;
	name?: string | null;
	image?: string | null;
}

const NAV_LINKS = [
	{ href: "/feed", icon: Home, label: "Feed" },
	{ href: "/discover", icon: Compass, label: "Explore" },
	{ href: "/collaborations", icon: Users, label: "Network" },
	{ href: "/messages", icon: MessageSquare, label: "Messages" },
] as const;

export function Navigation({ user }: { user: NavigationUser }) {
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
								priority
							/>
						</div>
					</Link>

					{/* Main Navigation Links - Right Side */}
					<div className="flex items-center gap-4">
						<div className="hidden items-center gap-1 md:flex">
							{NAV_LINKS.map((link) => (
								<NavLink key={link.href} href={link.href} icon={link.icon}>
									{link.label}
								</NavLink>
							))}
						</div>

						<Link
							href="/post/create"
							className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-sm text-white shadow-sm transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-md md:flex"
						>
							<FileText className="h-4 w-4" />
							<span>Create</span>
						</Link>

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
						<MobileNavLink
							key={link.href}
							href={link.href}
							icon={link.icon}
							label={link.label}
						/>
					))}
					<MobileNavLink
						href="/post/create"
						icon={FileText}
						label="Create"
						highlight
					/>
				</div>
			</div>
		</nav>
	);
}

function NavLink({
	href,
	icon: Icon,
	children,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isActive = pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link
			href={href}
			className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-all ${
				isActive
					? "bg-purple-50 text-purple-700"
					: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
			}`}
		>
			<Icon className="h-4 w-4" />
			<span>{children}</span>
		</Link>
	);
}

function MobileNavLink({
	href,
	icon: Icon,
	label,
	highlight = false,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	highlight?: boolean;
}) {
	const pathname = usePathname();
	const isActive = pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link
			href={href}
			className={`flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 transition-all ${
				highlight
					? "text-purple-600"
					: isActive
						? "bg-purple-50 text-purple-700"
						: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
			}`}
		>
			<Icon className="h-5 w-5" />
			<span className="font-medium text-xs">{label}</span>
		</Link>
	);
}
