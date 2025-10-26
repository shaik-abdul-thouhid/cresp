import { Award, Handshake, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "~/components/auth/signup-form";
import { getCurrentUser } from "~/lib/auth/get-user";

interface SignupPageProps {
	searchParams: Promise<{ returnUrl?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
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
			{/* Tagline */}
			<p className="mb-4 text-center text-gray-300 text-lg">
				Join the creative community
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

			{/* Signup card */}
			<div className="rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8">
				<h2 className="mb-4 text-center font-semibold text-2xl text-white">
					Create Your Account
				</h2>

				<SignupForm />

				<div className="mt-4 text-center">
					<p className="text-gray-400 text-sm">
						Already have an account?{" "}
						<Link
							href={
								returnUrl
									? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
									: "/login"
							}
							className="font-semibold text-purple-300 hover:text-purple-200"
						>
							Sign in
						</Link>
					</p>
				</div>

				<p className="mt-4 text-center text-gray-400 text-xs">
					By signing up, you agree to our{" "}
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
