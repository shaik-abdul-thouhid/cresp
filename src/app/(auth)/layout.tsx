import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "~/lib/auth/get-user";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	// Redirect to login if not authenticated
	if (!user) {
		const headersList = await headers();
		const pathname = headersList.get("x-pathname") || "/feed";
		// Add returnUrl to preserve the intended destination
		redirect(`/login?returnUrl=${encodeURIComponent(pathname)}`);
	}

	// Simple wrapper without navigation (journey page has its own styling)
	return <>{children}</>;
}
