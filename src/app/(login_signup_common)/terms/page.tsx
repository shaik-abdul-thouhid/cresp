import Link from "next/link";
import { getCurrentUser } from "~/lib/auth/get-user";

export default async function TermsPage() {
	const user = await getCurrentUser();

	return (
		<div className="flex h-[90vh] max-h-[800px] w-full max-w-md flex-col rounded-2xl bg-white/10 shadow-2xl backdrop-blur-md lg:max-w-3xl">
			{/* Fixed Header */}
			<div className="shrink-0 border-white/10 border-b p-6 pb-4">
				<h1 className="text-center font-bold text-3xl text-white">
					Terms and Conditions
				</h1>
			</div>

			{/* Scrollable Content */}
			<div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 flex-1 space-y-6 overflow-y-auto p-6 text-gray-300 text-sm">
				{/* Prototype Notice */}
				<div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
					<h2 className="mb-2 font-semibold text-yellow-200">
						⚠️ Prototype Notice
					</h2>
					<p className="text-xs text-yellow-300">
						This is a trial prototype version of Cresp. Features and services
						are provided "as-is" for testing and evaluation purposes only.
					</p>
				</div>

				{/* Section 1 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						1. Acceptance of Terms
					</h2>
					<p>
						By accessing and using Cresp, you agree to be bound by these Terms
						and Conditions. If you do not agree with any part of these terms,
						please do not use our platform.
					</p>
				</div>

				{/* Section 2 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						2. Content Ownership
					</h2>
					<p className="mb-2">
						<strong className="text-white">You own your content.</strong> All
						content you create, upload, or share on Cresp remains your
						intellectual property.
					</p>
					<ul className="ml-6 list-disc space-y-1">
						<li>Cresp does not claim ownership of your work</li>
						<li>Your content will not be used for commercial purposes</li>
						<li>You retain all rights to your creative works</li>
						<li>You may delete your content at any time</li>
					</ul>
				</div>

				{/* Section 3 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						3. Data Collection & Usage
					</h2>
					<p className="mb-2">
						As a prototype platform, we collect limited user metrics solely to
						improve the platform experience:
					</p>
					<ul className="ml-6 list-disc space-y-1">
						<li>Account information (username, email)</li>
						<li>Platform usage analytics</li>
						<li>Feature interaction data</li>
						<li>Performance and error logs</li>
					</ul>
					<p className="mt-2">
						All data is collected exclusively for platform improvement and will
						not be shared with third parties.
					</p>
				</div>

				{/* Section 4 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						4. User Responsibilities
					</h2>
					<ul className="ml-6 list-disc space-y-1">
						<li>Maintain the confidentiality of your account</li>
						<li>Do not share offensive or illegal content</li>
						<li>Respect other users' intellectual property</li>
						<li>Use the platform in good faith</li>
					</ul>
				</div>

				{/* Section 5 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						5. Prototype Limitations
					</h2>
					<p>
						As this is a prototype version, the platform may experience
						downtime, bugs, or data loss. We recommend not using this platform
						for critical projects or sensitive data.
					</p>
				</div>

				{/* Section 6 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						6. Modifications
					</h2>
					<p>
						We reserve the right to modify these terms at any time. Continued
						use of the platform constitutes acceptance of any changes.
					</p>
				</div>

				{/* Last Updated */}
				<div className="border-gray-700 border-t pt-4 text-center text-gray-400 text-xs">
					<p>Last updated: {new Date().toLocaleDateString()}</p>
					<p className="mt-2">
						Questions? Contact us through the platform support channels.
					</p>
				</div>
			</div>

			{/* Fixed Footer */}
			<div className="shrink-0 border-white/10 border-t p-4 text-center">
				<Link
					href={user ? "/feed" : "/login"}
					className="text-purple-300 text-sm hover:text-purple-200"
				>
					← Back to {user ? "Feed" : "Login"}
				</Link>
			</div>
		</div>
	);
}
