import { FloatingReferralButton } from "~/components/floating-referral-button";
import { Footer } from "~/components/footer";
import { Navigation } from "~/components/navigation";
import { PublicNavigation } from "~/components/public-navigation";
import { PWAInstallPrompt } from "~/components/pwa-install-prompt";
import { getAuthenticatedUser } from "~/lib/auth/get-user";

interface PageLayoutProps {
	children: React.ReactNode;
}

export async function PageLayout({ children }: PageLayoutProps) {
	// OPTIMIZED: Single query instead of getCurrentUser() + getFullUserData()
	const authData = await getAuthenticatedUser();
	const fullUser = authData?.user ?? null;

	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			{/* Render navigation based on auth status */}
			{fullUser ? <Navigation user={fullUser} /> : <PublicNavigation />}

			<main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8">
				{children}
			</main>

			<Footer />

			{/* Show extras only for authenticated users */}
			{fullUser && (
				<>
					<FloatingReferralButton />
					<PWAInstallPrompt />
				</>
			)}
		</div>
	);
}
