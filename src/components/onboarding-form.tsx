"use client";

import Image from "next/image";
import { useState } from "react";
import { completeOnboarding } from "~/server/actions/onboarding";
import type { CreativeRole } from "~/types";

interface OnboardingFormProps {
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
}

const creativeRoles: { value: CreativeRole; label: string; emoji: string }[] = [
	{ value: "director", label: "Director", emoji: "🎬" },
	{ value: "actor", label: "Actor", emoji: "🎭" },
	{ value: "writer", label: "Writer", emoji: "✍️" },
	{ value: "screenwriter", label: "Screenplay Writer", emoji: "📝" },
	{ value: "singer", label: "Singer", emoji: "🎤" },
	{ value: "lyricist", label: "Lyricist", emoji: "🎵" },
	{ value: "photographer", label: "Photographer", emoji: "📸" },
	{ value: "video-editor", label: "Video Editor", emoji: "🎞️" },
	{ value: "composer", label: "Composer", emoji: "🎹" },
	{ value: "producer", label: "Producer", emoji: "🎥" },
	{ value: "cinematographer", label: "Cinematographer", emoji: "📹" },
	{ value: "dancer", label: "Dancer", emoji: "💃" },
	{ value: "choreographer", label: "Choreographer", emoji: "🕺" },
	{ value: "other", label: "Other", emoji: "⭐" },
];

export function OnboardingForm({ user }: OnboardingFormProps) {
	const [step, setStep] = useState(1);
	const [selectedRoles, setSelectedRoles] = useState<CreativeRole[]>([]);
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const toggleRole = (role: CreativeRole) => {
		setSelectedRoles(
			(prev) =>
				prev.includes(role)
					? prev.filter((r) => r !== role)
					: [...prev, role].slice(0, 3), // Max 3 roles
		);
	};

	const handleComplete = async () => {
		setIsSubmitting(true);
		try {
			await completeOnboarding({
				userId: user.id,
				roles: selectedRoles,
				bio,
				location,
			});
			// Redirect will happen server-side
		} catch (error) {
			console.error("Error completing onboarding:", error);
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md">
			{/* Step 1: Welcome & Role Selection */}
			{step === 1 && (
				<div className="space-y-6">
					<div className="text-center">
						{user.image && (
							<div className="mb-4 flex justify-center">
								<div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-purple-500">
									<Image
										src={user.image}
										alt={user.name ?? ""}
										fill
										className="object-cover"
									/>
								</div>
							</div>
						)}
						<h2 className="mb-2 font-bold text-2xl text-white">
							Hi {user.name?.split(" ")[0]}! 👋
						</h2>
						<p className="text-gray-300">
							What best describes your creative profession?
						</p>
						<p className="mt-2 text-gray-400 text-sm">
							Select up to 3 roles that match your skills
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						{creativeRoles.map((role) => (
							<button
								key={role.value}
								type="button"
								onClick={() => toggleRole(role.value)}
								className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
									selectedRoles.includes(role.value)
										? "border-purple-500 bg-purple-500/20"
										: "border-white/20 bg-white/5 hover:border-purple-300 hover:bg-white/10"
								}`}
							>
								<span className="text-2xl">{role.emoji}</span>
								<span className="font-medium text-white">{role.label}</span>
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={() => setStep(2)}
						disabled={selectedRoles.length === 0}
						className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Continue
					</button>
				</div>
			)}

			{/* Step 2: Bio */}
			{step === 2 && (
				<div className="space-y-6">
					<div className="text-center">
						<h2 className="mb-2 font-bold text-2xl text-white">
							Tell us about yourself
						</h2>
						<p className="text-gray-300">Share your creative story</p>
					</div>

					<div>
						<label
							htmlFor="bio"
							className="mb-2 block font-medium text-gray-200 text-sm"
						>
							Bio
						</label>
						<textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder="I'm a passionate creative who loves to..."
							rows={6}
							className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
						<p className="mt-1 text-gray-400 text-xs">
							{bio.length}/500 characters
						</p>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => setStep(1)}
							className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
						>
							Back
						</button>
						<button
							type="button"
							onClick={() => setStep(3)}
							className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{/* Step 3: Location */}
			{step === 3 && (
				<div className="space-y-6">
					<div className="text-center">
						<h2 className="mb-2 font-bold text-2xl text-white">
							Where are you based?
						</h2>
						<p className="text-gray-300">
							Help others find local collaborators
						</p>
					</div>

					<div>
						<label
							htmlFor="location"
							className="mb-2 block font-medium text-gray-200 text-sm"
						>
							Location (Optional)
						</label>
						<input
							type="text"
							id="location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							placeholder="e.g., Los Angeles, CA"
							className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => setStep(2)}
							className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
						>
							Back
						</button>
						<button
							type="button"
							onClick={() => setStep(4)}
							className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{/* Step 4: Confirmation */}
			{step === 4 && (
				<div className="space-y-6">
					<div className="text-center">
						<div className="mb-4 text-6xl">🎉</div>
						<h2 className="mb-2 font-bold text-2xl text-white">
							You're all set!
						</h2>
						<p className="text-gray-300">
							Ready to start your creative journey on Cresp
						</p>
					</div>

					{/* Summary */}
					<div className="space-y-4 rounded-lg bg-white/5 p-6">
						<div>
							<h3 className="mb-2 font-semibold text-gray-200 text-sm">
								Your Roles
							</h3>
							<div className="flex flex-wrap gap-2">
								{selectedRoles.map((role) => {
									const roleData = creativeRoles.find((r) => r.value === role);
									return (
										<span
											key={role}
											className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-white"
										>
											{roleData?.emoji} {roleData?.label}
										</span>
									);
								})}
							</div>
						</div>

						{bio && (
							<div>
								<h3 className="mb-2 font-semibold text-gray-200 text-sm">
									Bio
								</h3>
								<p className="text-gray-300 text-sm">{bio}</p>
							</div>
						)}

						{location && (
							<div>
								<h3 className="mb-2 font-semibold text-gray-200 text-sm">
									Location
								</h3>
								<p className="text-gray-300 text-sm">📍 {location}</p>
							</div>
						)}
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => setStep(3)}
							disabled={isSubmitting}
							className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Back
						</button>
						<button
							type="button"
							onClick={handleComplete}
							disabled={isSubmitting}
							className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? "Completing..." : "Start Journey"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
