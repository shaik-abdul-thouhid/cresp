"use client";

import { useLogout } from "~/hooks/use-auth-mutations";

export function LogoutButton() {
	const logoutMutation = useLogout();

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={logoutMutation.isPending}
			className="w-full rounded-lg px-3 py-2.5 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{logoutMutation.isPending ? "Signing out..." : "Sign Out"}
		</button>
	);
}
