"use client";

import { ArrowRight, CheckCircle, Film, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { joinWaitlist } from "~/server/actions/waitlist";

export default function Home() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [signupCount] = useState(47); // Social proof counter

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		const result = await joinWaitlist(email, undefined);

		if (result.success) {
			setIsSubmitted(true);
			setEmail("");
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
			<section className="px-6 pt-12 pb-20">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
						<Sparkles className="h-4 w-4" />
						<span>For Independent Filmmakers</span>
					</div>

					<h1 className="mb-4 font-extrabold text-5xl text-white leading-tight md:text-6xl">
						Find Film Crew
						<br />
						<span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
							From Anywhere
						</span>
					</h1>

					<p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 leading-relaxed md:text-xl">
						Connect with editors, sound designers, and cinematographers
						globally.
						<strong className="text-white">
							{" "}
							Shoot local. Work remote. Get everyone credited.
						</strong>
					</p>

					{!isSubmitted ? (
						<>
							<div className="mb-6 flex items-center justify-center gap-2 text-sm text-white/70">
								<Users className="h-4 w-4" />
								<span>{signupCount} filmmakers waiting for launch</span>
							</div>
							<form
								id="signup-form"
								onSubmit={handleSubmit}
								className="mx-auto max-w-md"
							>
								<div className="flex flex-col gap-3 sm:flex-row">
									<input
										id="email-input"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="your@email.com"
										required
										className="flex-1 rounded-lg bg-white/95 px-5 py-4 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
									/>
									<button
										type="submit"
										disabled={isSubmitting}
										className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 font-bold text-base text-white shadow-xl transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"
									>
										{isSubmitting ? (
											"Joining..."
										) : (
											<>
												Get Early Access
												<ArrowRight className="h-4 w-4" />
											</>
										)}
									</button>
								</div>
								{error && <p className="mt-3 text-red-300 text-sm">{error}</p>}
								<p className="mt-3 text-white/60 text-xs">
									Join the waitlist • Be first to know when we launch
								</p>
							</form>
						</>
					) : (
						<div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
							<CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
							<h3 className="mb-2 font-bold text-white text-xl">
								You're in! 🎬
							</h3>
							<p className="text-white/80">
								We'll email you when Cresp launches. Thanks for joining!
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Stats / Social Proof */}
			<section className="border-white/10 border-y bg-black/20 px-6 py-12">
				<div className="mx-auto max-w-5xl">
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
						<div className="text-center">
							<div className="mb-1 font-bold text-3xl text-white">Global</div>
							<div className="text-sm text-white/60">Find Crew Anywhere</div>
						</div>
						<div className="text-center">
							<div className="mb-1 font-bold text-3xl text-white">Track</div>
							<div className="text-sm text-white/60">Every Contribution</div>
						</div>
						<div className="text-center">
							<div className="mb-1 font-bold text-3xl text-white">Credit</div>
							<div className="text-sm text-white/60">Everyone Recognized</div>
						</div>
						<div className="text-center">
							<div className="mb-1 font-bold text-3xl text-white">Free</div>
							<div className="text-sm text-white/60">No Cost to Use</div>
						</div>
					</div>
				</div>
			</section>

			{/* The Problem Section */}
			<section className="px-6 py-16">
				<div className="mx-auto max-w-3xl">
					<div className="rounded-2xl border border-white/20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-8 backdrop-blur-sm md:p-10">
						<h2 className="mb-4 text-center font-bold text-2xl text-white md:text-3xl">
							You Have Ideas. You Need People.
						</h2>
						<p className="mx-auto mb-4 max-w-xl text-center text-white/80 leading-relaxed">
							Making films usually means working with people you already know.
							<strong className="text-white">
								{" "}
								But what if you could find crew from anywhere?
							</strong>
						</p>
						<p className="mx-auto max-w-xl text-center text-white/80 leading-relaxed">
							Editors in Berlin. Sound designers in Toronto. Cinematographers in
							LA. Cresp helps indie filmmakers find each other and create things
							they couldn't make alone.
						</p>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="bg-black/20 px-6 py-16">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-10 text-center font-bold text-3xl text-white md:text-4xl">
						How It Works
					</h2>

					<div className="grid gap-6 md:grid-cols-3">
						{/* Step 1 */}
						<div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-lg text-white">
								1
							</div>
							<h3 className="mb-2 font-bold text-lg text-white">
								Post Your Project
							</h3>
							<p className="text-sm text-white/70 leading-relaxed">
								Describe your film and what roles you need. Short, doc, music
								video—whatever you're making.
							</p>
						</div>

						{/* Step 2 */}
						<div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-lg text-white">
								2
							</div>
							<h3 className="mb-2 font-bold text-lg text-white">
								Find Collaborators
							</h3>
							<p className="text-sm text-white/70 leading-relaxed">
								People with the skills you need find your project and join.
								Build your crew from anywhere.
							</p>
						</div>

						{/* Step 3 */}
						<div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
							<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-lg text-white">
								3
							</div>
							<h3 className="mb-2 font-bold text-lg text-white">
								Work & Get Credited
							</h3>
							<p className="text-sm text-white/70 leading-relaxed">
								Contributions tracked, everyone credited. Work preserved even if
								people leave.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Use Case Example */}
			<section className="px-6 py-16">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-8 text-center font-bold text-3xl text-white md:text-4xl">
						Real Example: "The Last Train"
					</h2>

					<div className="rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm md:p-8">
						<div className="mb-6">
							<h3 className="mb-2 font-bold text-white text-xl md:text-2xl">
								10-minute sci-fi short about a time loop
							</h3>
							<p className="text-white/70">
								Sarah (Director in NYC) needs crew
							</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-lg border border-white/10 bg-white/5 p-5">
								<h4 className="mb-3 font-semibold text-white">
									What She Posts:
								</h4>
								<ul className="space-y-1.5 text-sm text-white/70">
									<li>• Script done, need: Editor, Sound, Color</li>
									<li>• Timeline: 3 months pre to post</li>
									<li>• 2 days shoot NYC, post remote</li>
								</ul>
							</div>

							<div className="rounded-lg border border-white/10 bg-white/5 p-5">
								<h4 className="mb-3 font-semibold text-white">Who Joins:</h4>
								<ul className="space-y-1.5 text-sm text-white/70">
									<li>• Mike (Cinematographer) - LA</li>
									<li>• Elena (Editor) - Berlin</li>
									<li>• James (Sound) - Toronto</li>
								</ul>
							</div>
						</div>

						<div className="mt-4 rounded-lg border border-white/20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4">
							<p className="text-center text-sm text-white/90">
								<strong>3 months later:</strong> Film complete. Everyone
								credited. Sarah submits to festivals. Team adds it to
								portfolios.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features Preview */}
			<section className="bg-black/20 px-6 py-16">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-10 text-center font-bold text-3xl text-white md:text-4xl">
						Why Cresp?
					</h2>

					<div className="grid gap-6 md:grid-cols-2">
						<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
							<Users className="mb-3 h-10 w-10 text-purple-400" />
							<h3 className="mb-2 font-bold text-white">Find Crew Globally</h3>
							<p className="text-sm text-white/70">
								Not limited to your city. Connect with skilled filmmakers
								worldwide.
							</p>
						</div>

						<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
							<CheckCircle className="mb-3 h-10 w-10 text-green-400" />
							<h3 className="mb-2 font-bold text-white">
								Proper Credit Tracking
							</h3>
							<p className="text-sm text-white/70">
								Every contribution timestamped. No disputes. Everyone gets
								recognized.
							</p>
						</div>

						<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
							<Film className="mb-3 h-10 w-10 text-pink-400" />
							<h3 className="mb-2 font-bold text-white">
								Built for Filmmaking
							</h3>
							<p className="text-sm text-white/70">
								Not generic PM tools. Designed for roles, milestones, revisions,
								credits.
							</p>
						</div>

						<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
							<Sparkles className="mb-3 h-10 w-10 text-yellow-400" />
							<h3 className="mb-2 font-bold text-white">You Own Your Work</h3>
							<p className="text-sm text-white/70">
								Platform doesn't own your film. We coordinate, you keep rights.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="mb-4 font-bold text-3xl text-white md:text-4xl">
						Ready to Find Your Crew?
					</h2>
					<p className="mb-8 text-lg text-white/80">
						Join {signupCount} filmmakers waiting for launch.
					</p>

					{!isSubmitted && (
						<button
							type="button"
							onClick={() => {
								document.getElementById("signup-form")?.scrollIntoView({
									behavior: "smooth",
									block: "center",
								});
								setTimeout(() => {
									document.getElementById("email-input")?.focus();
								}, 500);
							}}
							className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:from-pink-600 hover:to-purple-700"
						>
							Get Early Access
							<ArrowRight className="h-5 w-5" />
						</button>
					)}
				</div>
			</section>

			{/* Footer */}
			<footer className="border-white/10 border-t px-6 py-6">
				<div className="mx-auto max-w-7xl text-center text-sm text-white/60">
					<p>© 2025 Cresp. Built for independent filmmakers.</p>
				</div>
			</footer>
		</div>
	);
}
