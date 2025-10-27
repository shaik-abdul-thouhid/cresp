"use client";

import { ArrowRight, CheckCircle, Film, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { joinWaitlist } from "~/server/actions/waitlist";

export default function Home() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("");
	const [painPoint, setPainPoint] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		// Combine role and pain point into feedback field
		const feedback = [
			role && `Role: ${role}`,
			painPoint && `Pain point: ${painPoint}`,
		]
			.filter(Boolean)
			.join(" | ");

		const result = await joinWaitlist(email, feedback || undefined);

		if (result.success) {
			setIsSubmitted(true);
			setEmail("");
			setRole("");
			setPainPoint("");
		} else {
			setError(result.error || "Something went wrong");
		}

		setIsSubmitting(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
			{/* Navigation */}
			<nav className="px-6 py-4">
				<div className="mx-auto max-w-7xl">
					<div className="flex items-center gap-2 font-bold text-2xl text-white">
						<Film className="h-8 w-8" />
						<span>Cresp</span>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="px-6 pt-20 pb-32">
				<div className="mx-auto max-w-4xl text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
						<Sparkles className="h-4 w-4" />
						<span>For Independent Filmmakers</span>
					</div>

					<h1 className="mb-6 font-extrabold text-5xl text-white leading-tight md:text-7xl">
						Collaborate on Films
						<br />
						<span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
							With Anyone, Anywhere
						</span>
					</h1>

					<p className="mx-auto mb-12 max-w-3xl text-white/80 text-xl leading-relaxed md:text-2xl">
						Find crew and collaborators from anywhere. Shoot locally, work on
						post remotely. Get everyone properly credited. Built for indie
						filmmakers.
					</p>

					{!isSubmitted ? (
						<form
							id="signup-form"
							onSubmit={handleSubmit}
							className="mx-auto max-w-xl"
						>
							<div className="mb-4">
								<input
									id="email-input"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Your email"
									required
									className="w-full rounded-lg bg-white/95 px-6 py-4 text-gray-900 text-lg placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
								/>
							</div>
							<div className="mb-4">
								<input
									type="text"
									value={role}
									onChange={(e) => setRole(e.target.value)}
									placeholder="Your role (e.g., Director, Editor, Writer)"
									className="w-full rounded-lg bg-white/95 px-6 py-4 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
								/>
							</div>
							<div className="mb-6">
								<input
									type="text"
									value={painPoint}
									onChange={(e) => setPainPoint(e.target.value)}
									placeholder="Biggest challenge with remote film collaboration?"
									className="w-full rounded-lg bg-white/95 px-6 py-4 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
								/>
							</div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isSubmitting ? (
									"Joining..."
								) : (
									<>
										Join the Waitlist
										<ArrowRight className="h-5 w-5" />
									</>
								)}
							</button>
							{error && <p className="mt-4 text-red-300 text-sm">{error}</p>}
						</form>
					) : (
						<div className="mx-auto max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
							<CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-400" />
							<h3 className="mb-2 font-bold text-2xl text-white">
								You're on the list! 🎬
							</h3>
							<p className="text-white/80">
								We'll email you when we launch. Thanks for your interest!
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Stats / Social Proof */}
			<section className="mt-10 border-white/10 border-y bg-black/20 px-6 py-16">
				<div className="mx-auto max-w-5xl">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">Global</div>
							<div className="text-sm text-white/60">Find Crew Anywhere</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">Track</div>
							<div className="text-sm text-white/60">Every Contribution</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">Credit</div>
							<div className="text-sm text-white/60">
								Everyone Gets Recognized
							</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">Free</div>
							<div className="text-sm text-white/60">No Cost to Use</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="bg-black/20 px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-16 text-center font-bold text-4xl text-white md:text-5xl">
						How It Works
					</h2>

					<div className="grid gap-8 md:grid-cols-3">
						{/* Step 1 */}
						<div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white text-xl">
								1
							</div>
							<h3 className="mb-4 font-bold text-2xl text-white">
								Post Your Project
							</h3>
							<p className="text-white/70 leading-relaxed">
								Describe your film idea and what roles you need. Short film,
								documentary, music video—whatever you're making.
							</p>
						</div>

						{/* Step 2 */}
						<div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white text-xl">
								2
							</div>
							<h3 className="mb-4 font-bold text-2xl text-white">
								Find Collaborators
							</h3>
							<p className="text-white/70 leading-relaxed">
								People with the skills you need can find your project and join.
								Writers, editors, sound designers, cinematographers—build your
								crew.
							</p>
						</div>

						{/* Step 3 */}
						<div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white text-xl">
								3
							</div>
							<h3 className="mb-4 font-bold text-2xl text-white">
								Work Together & Get Credited
							</h3>
							<p className="text-white/70 leading-relaxed">
								Contributions are tracked so everyone gets proper credit. Work
								is preserved even if people leave. Everything is transparent.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* The Problem Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<div className="rounded-3xl border border-white/20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-12 backdrop-blur-sm">
						<h2 className="mb-6 text-center font-bold text-3xl text-white md:text-4xl">
							You Have Ideas. <br />
							You Need People.
						</h2>
						<p className="mx-auto mb-6 max-w-2xl text-center text-lg text-white/80 leading-relaxed">
							Making films usually means working with people you already know.
							But what if you could find crew from anywhere—editors in Berlin,
							sound designers in Toronto, cinematographers in LA?
						</p>
						<p className="mx-auto max-w-2xl text-center text-lg text-white/80 leading-relaxed">
							Cresp helps indie filmmakers find each other, coordinate across
							locations, and create things they couldn't make alone.
						</p>
					</div>
				</div>
			</section>

			{/* Features Preview */}
			<section className="bg-black/20 px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-16 text-center font-bold text-4xl text-white md:text-5xl">
						What Makes Cresp Different
					</h2>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 backdrop-blur-sm">
							<Users className="mb-4 h-12 w-12 text-purple-400" />
							<h3 className="mb-3 font-bold text-white text-xl">
								Find People Anywhere
							</h3>
							<p className="text-white/70">
								Connect with filmmakers from around the world. You shoot
								locally, but can find editors, sound designers, and crew from
								anywhere.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 backdrop-blur-sm">
							<CheckCircle className="mb-4 h-12 w-12 text-green-400" />
							<h3 className="mb-3 font-bold text-white text-xl">
								Track Contributions
							</h3>
							<p className="text-white/70">
								See who contributed what and when. No more disputes about
								credit. Everyone's work is visible and timestamped.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 backdrop-blur-sm">
							<Film className="mb-4 h-12 w-12 text-pink-400" />
							<h3 className="mb-3 font-bold text-white text-xl">
								Built for Films
							</h3>
							<p className="text-white/70">
								Not generic project management. Designed for how films actually
								get made—roles, milestones, revisions, and credits.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 backdrop-blur-sm">
							<Sparkles className="mb-4 h-12 w-12 text-yellow-400" />
							<h3 className="mb-3 font-bold text-white text-xl">
								You Own Your Work
							</h3>
							<p className="text-white/70">
								The platform doesn't own your film. You do. We just help you
								coordinate and make sure everyone gets proper credit.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Use Case Example */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-12 text-center font-bold text-4xl text-white md:text-5xl">
						How It Could Work
					</h2>

					<div className="rounded-3xl border border-white/20 bg-black/30 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8">
							<div className="mb-3 inline-block rounded-full bg-pink-500/20 px-4 py-1 font-medium text-pink-300 text-sm">
								Example Project
							</div>
							<h3 className="mb-4 font-bold text-2xl text-white md:text-3xl">
								"The Last Train" - A 10-minute Short Film
							</h3>
							<p className="text-lg text-white/70">
								A sci-fi thriller about a subway passenger who discovers they're
								trapped in a time loop.
							</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<div className="rounded-xl border border-white/10 bg-white/5 p-6">
								<h4 className="mb-4 font-semibold text-lg text-white">
									What Sarah (Director) Posts:
								</h4>
								<ul className="space-y-2 text-white/70">
									<li className="flex items-start gap-2">
										<span className="mt-1 text-pink-400">•</span>
										<span>Script is finished, need crew</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1 text-pink-400">•</span>
										<span>
											Looking for: Cinematographer, Editor, Sound Designer
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1 text-pink-400">•</span>
										<span>Timeline: 3 months from pre to post</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1 text-pink-400">•</span>
										<span>2 days shooting in NYC, post-production remote</span>
									</li>
								</ul>
							</div>

							<div className="rounded-xl border border-white/10 bg-white/5 p-6">
								<h4 className="mb-4 font-semibold text-lg text-white">
									Who Joins:
								</h4>
								<ul className="space-y-2 text-white/70">
									<li className="flex items-start gap-2">
										<span className="mt-1 text-purple-400">•</span>
										<span>
											Mike (Cinematographer) from LA - has shot 5 shorts
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1 text-purple-400">•</span>
										<span>
											Elena (Editor) from Berlin - specializes in sci-fi
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1 text-purple-400">•</span>
										<span>
											James (Sound) from Toronto - has festival credits
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div className="mt-6 rounded-xl border border-white/20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-6">
							<p className="text-center text-lg text-white/90">
								3 months later: Film is complete. Everyone gets credited. Sarah
								uploads it to festivals. The team can point to their work in
								their portfolio.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="px-6 py-32">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="mb-6 font-bold text-4xl text-white md:text-5xl">
						Want to Try This?
					</h2>
					<p className="mb-12 text-white/80 text-xl">
						We're building Cresp now. Join the waitlist to be notified when we
						launch.
					</p>

					{!isSubmitted && (
						<button
							type="button"
							onClick={() => {
								document.getElementById("signup-form")?.scrollIntoView({
									behavior: "smooth",
									block: "center",
								});
								// Focus the email input after scroll
								setTimeout(() => {
									document.getElementById("email-input")?.focus();
								}, 500);
							}}
							className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-2xl"
						>
							Join the Waitlist
							<ArrowRight className="h-5 w-5" />
						</button>
					)}
				</div>
			</section>

			{/* Footer */}
			<footer className="border-white/10 border-t px-6 py-8">
				<div className="mx-auto max-w-7xl text-center text-sm text-white/60">
					<p>© 2025 Cresp. Built for independent filmmakers.</p>
				</div>
			</footer>
		</div>
	);
}
