import { redirect } from "next/navigation";
import { PageLayout } from "~/components/layouts/page-layout";
import { getAuthenticatedUser } from "~/lib/auth/get-user";

export default async function WithNavigationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// OPTIMIZED: Use combined query
	// Note: PageLayout also calls getAuthenticatedUser(), but React cache()
	// ensures it only queries the database once per request
	const authData = await getAuthenticatedUser();

	if (!authData || !authData.user) {
		redirect("/login");
	}

	// Note: Onboarding flow is handled by individual pages
	// - /journey page redirects to /feed if onboarding is complete
	// - Other pages (feed, etc.) redirect to /journey if onboarding is not complete

	return <PageLayout>{children}</PageLayout>;
}
