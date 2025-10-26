import Link from "next/link";
import { getCurrentUser } from "~/lib/auth/get-user";

export default async function PrivacyPolicyPage() {
	const user = await getCurrentUser();

	return (
		<div className="flex h-[90vh] max-h-[800px] w-full max-w-md flex-col rounded-2xl bg-white/10 shadow-2xl backdrop-blur-md lg:max-w-3xl">
			{/* Fixed Header */}
			<div className="shrink-0 border-white/10 border-b p-6 pb-4">
				<h1 className="text-center font-bold text-3xl text-white">
					Privacy Policy
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
						This is a trial prototype. We collect minimal data solely for
						improving the platform experience. Your privacy is important to us.
					</p>
				</div>

				{/* Section 1 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						1. Information We Collect
					</h2>
					<p className="mb-2">
						We collect only essential information needed to provide and improve
						our services:
					</p>
					<ul className="ml-6 list-disc space-y-1">
						<li>
							<strong className="text-white">Account Information:</strong>{" "}
							Username, email address, profile details
						</li>
						<li>
							<strong className="text-white">Usage Metrics:</strong> Platform
							interactions, feature usage, navigation patterns
						</li>
						<li>
							<strong className="text-white">Technical Data:</strong> Browser
							type, device information, IP address, error logs
						</li>
						<li>
							<strong className="text-white">Content Metadata:</strong> Upload
							dates, file sizes (not the actual content)
						</li>
					</ul>
				</div>

				{/* Section 2 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						2. How We Use Your Information
					</h2>
					<p className="mb-2">
						All collected data is used exclusively for platform improvement:
					</p>
					<ul className="ml-6 list-disc space-y-1">
						<li>Improving user experience and interface design</li>
						<li>Identifying and fixing bugs or technical issues</li>
						<li>Understanding feature usage and engagement</li>
						<li>Enhancing platform performance and reliability</li>
						<li>Providing customer support</li>
					</ul>
					<p className="mt-2 font-semibold text-white">
						We do NOT sell, rent, or share your data with third parties for
						marketing purposes.
					</p>
				</div>

				{/* Section 3 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						3. Your Content & Intellectual Property
					</h2>
					<p className="mb-2">
						<strong className="text-white">You own your content.</strong> Cresp
						does not claim any ownership rights over your creative works.
					</p>
					<ul className="ml-6 list-disc space-y-1">
						<li>Your content remains your property at all times</li>
						<li>We do not analyze or use your content for any purpose</li>
						<li>
							Your content is not used for AI training or commercial purposes
						</li>
						<li>You can delete your content anytime</li>
					</ul>
				</div>

				{/* Section 4 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						4. Data Security
					</h2>
					<p>
						We implement industry-standard security measures to protect your
						data, including encryption, secure authentication, and regular
						security audits. However, as a prototype, we cannot guarantee
						absolute security.
					</p>
				</div>

				{/* Section 5 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						5. Data Retention
					</h2>
					<p>
						We retain your data only as long as necessary for platform
						improvement purposes. As a prototype, data may be periodically reset
						or cleared. You can request deletion of your account and associated
						data at any time.
					</p>
				</div>

				{/* Section 6 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						6. Cookies & Tracking
					</h2>
					<p>
						We use essential cookies for authentication and session management.
						No third-party tracking or advertising cookies are used.
					</p>
				</div>

				{/* Section 7 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						7. Your Rights
					</h2>
					<ul className="ml-6 list-disc space-y-1">
						<li>Access your personal data</li>
						<li>Request data correction or deletion</li>
						<li>Export your data</li>
						<li>Opt-out of data collection (may limit functionality)</li>
						<li>Delete your account at any time</li>
					</ul>
				</div>

				{/* Section 8 */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						8. Changes to This Policy
					</h2>
					<p>
						We may update this privacy policy as the platform evolves. We will
						notify users of significant changes. Continued use after changes
						constitutes acceptance.
					</p>
				</div>

				{/* Contact */}
				<div>
					<h2 className="mb-2 font-semibold text-lg text-white">
						9. Contact Us
					</h2>
					<p>
						For privacy concerns, data requests, or questions about this policy,
						please contact us through the platform support channels.
					</p>
				</div>

				{/* Last Updated */}
				<div className="border-gray-700 border-t pt-4 text-center text-gray-400 text-xs">
					<p>Last updated: {new Date().toLocaleDateString()}</p>
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
