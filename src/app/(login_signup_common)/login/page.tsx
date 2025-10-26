import { Award, Handshake, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "~/components/auth/login-form";
import { getCurrentUser } from "~/lib/auth/get-user";

interface LoginPageProps {
	searchParams: Promise<{ returnUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	// Check if user is already logged in
	const user = await getCurrentUser();
	const params = await searchParams;
	const returnUrl = params.returnUrl;

	// Validate return URL (must be internal, not external)
	const isValidReturnUrl =
		returnUrl?.startsWith("/") &&
		!returnUrl.startsWith("//") &&
		!returnUrl.includes("login") &&
		!returnUrl.includes("signup");

	if (user) {
		// Redirect based on onboarding status or return URL
		if (!user.onboardingCompleted) {
			redirect("/journey");
		}
		// If there's a valid return URL, go there
		if (isValidReturnUrl && returnUrl) {
			redirect(returnUrl);
		}
		redirect("/feed");
	}

	return (
		<>
			{/* Tagline and features */}
			<p className="mb-4 text-center text-gray-300 text-lg">
				Where creativity meets collaboration
			</p>

			{/* Three key features */}
			<div className="mb-6 flex flex-wrap justify-center gap-2 text-xs sm:gap-3 sm:text-sm">
				<div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2">
					<Video className="h-4 w-4 text-purple-300 sm:h-5 sm:w-5" />
					<span className="text-white">Showcase</span>
				</div>
				<div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2">
					<Award className="h-4 w-4 text-yellow-300 sm:h-5 sm:w-5" />
					<span className="text-white">Recognition</span>
				</div>
				<div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2">
					<Handshake className="h-4 w-4 text-indigo-300 sm:h-5 sm:w-5" />
					<span className="text-white">Collaboration</span>
				</div>
			</div>

			{/* Login card */}
			<div className="rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8">
				<h2 className="mb-4 text-center font-semibold text-2xl text-white">
					Welcome Back!
				</h2>

				<p className="mb-4 text-center text-gray-300 text-sm">
					Sign in to continue your creative journey
				</p>

				<LoginForm returnUrl={isValidReturnUrl ? returnUrl : undefined} />

				<div className="mt-4 text-center">
					<p className="text-gray-400 text-sm">
						Don't have an account?{" "}
						<Link
							href={
								returnUrl
									? `/signup?returnUrl=${encodeURIComponent(returnUrl)}`
									: "/signup"
							}
							className="font-semibold text-purple-300 hover:text-purple-200"
						>
							Sign up
						</Link>
					</p>
				</div>

				<p className="mt-4 text-center text-gray-400 text-xs">
					By continuing, you agree to our{" "}
					<Link href="/terms" className="text-purple-300 hover:text-purple-200">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy-policy"
						className="text-purple-300 hover:text-purple-200"
					>
						Privacy Policy
					</Link>
				</p>
			</div>

			{/* Community showcase */}
			<div className="mt-6 text-center">
				<p className="mb-2 text-gray-400 text-sm">
					For creators, artists, and innovators
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					{[
						"Directors",
						"Actors",
						"Writers",
						"Musicians",
						"Designers",
						"Photographers",
						"& More",
					].map((role) => (
						<span
							key={role}
							className="rounded-full bg-white/5 px-3 py-1 text-gray-300 text-xs backdrop-blur-sm"
						>
							{role}
						</span>
					))}
				</div>
			</div>
		</>
	);
}
