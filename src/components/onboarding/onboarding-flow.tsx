"use client";

import { Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorToast } from "~/components/ui/custom-toasts";

type OnboardingStep = "welcome" | "role-selection" | "profile-setup";
type UserType = "visitor" | "creator";

interface ProfessionalRole {
	id: string;
	name: string;
	key: string;
	description: string | null;
	icon: string | null;
}

interface OnboardingFlowProps {
	professionalRoles: ProfessionalRole[];
	username: string;
}

export function OnboardingFlow({
	professionalRoles,
	username,
}: OnboardingFlowProps) {
	const router = useRouter();
	const [step, setStep] = useState<OnboardingStep>("welcome");
	const [userType, setUserType] = useState<UserType | null>(null);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Profile form state
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");

	const handleUserTypeSelect = (type: UserType) => {
		setUserType(type);
		setIsAnimating(true);
		setTimeout(() => setIsAnimating(false), 300);
	};

	const handleContinueFromWelcome = () => {
		if (userType === "creator") {
			setStep("role-selection");
		} else {
			// Visitor goes straight to feed
			handleSkip();
		}
	};

	const toggleRoleSelection = (roleId: string) => {
		if (selectedRoles.includes(roleId)) {
			setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
		} else if (selectedRoles.length < 3) {
			setSelectedRoles([...selectedRoles, roleId]);
		}
	};

	const handleContinueFromRoles = () => {
		if (selectedRoles.length > 0) {
			setStep("profile-setup");
		}
	};

	const handleSkip = async () => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/onboarding/skip", {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to skip onboarding");
			}

			router.push("/feed");
			router.refresh();
		} catch (error) {
			console.error("Error skipping onboarding:", error);
			toast.custom(() => (
				<ErrorToast title="Failed to skip" message="Please try again" />
			));
			setIsSubmitting(false);
		}
	};

	const handleSubmitProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/onboarding/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					professionalRoleIds: selectedRoles,
					name: name.trim() || undefined,
					bio: bio.trim() || undefined,
					location: location.trim() || undefined,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to complete onboarding");
			}

			router.push("/feed");
			router.refresh();
		} catch (error) {
			console.error("Error completing onboarding:", error);
			toast.custom(() => (
				<ErrorToast
					title="Failed to complete onboarding"
					message="Please try again"
				/>
			));
			setIsSubmitting(false);
		}
	};

	return (
		<div className="relative min-h-[calc(100vh-200px)] w-full pt-10 sm:pt-0">
			{/* Skip button (only on role-selection and profile-setup) */}
			{(step === "role-selection" || step === "profile-setup") && (
				<button
					type="button"
					onClick={handleSkip}
					disabled={isSubmitting}
					className="absolute top-0 right-0 z-10 px-2 py-1 text-gray-400 text-sm hover:text-gray-300 disabled:opacity-50"
				>
					Skip for now →
				</button>
			)}

			{/* Welcome Step */}
			{step === "welcome" && (
				<div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center space-y-8">
					{/* Animated Welcome Text */}
					<div className="space-y-6 text-center">
						<div className="flex animate-fade-in-delayed-1 flex-col items-center gap-3">
							<h1 className="font-cursive font-normal text-3xl text-white/90 sm:text-4xl">
								Welcome to
							</h1>
							<Image
								src="/images/cresp.svg"
								alt="Cresp"
								width={400}
								height={120}
								className="h-20 w-auto sm:h-28"
								style={{ filter: "brightness(0) invert(1)" }}
							/>
						</div>
						<p className="animate-fade-in-delayed-2 text-gray-300 text-xl">
							Where creativity meets collaboration
						</p>
					</div>

					{/* User Type Selection */}
					<div className="grid w-full max-w-2xl animate-fade-in-delayed-3 gap-4 sm:grid-cols-2">
						{/* Visitor Option */}
						<button
							type="button"
							onClick={() => handleUserTypeSelect("visitor")}
							className={`group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all duration-300 ${
								userType === "visitor"
									? "border-indigo-500 bg-indigo-500/20 shadow-indigo-500/30 shadow-md"
									: "border-white/20 bg-white/5 hover:scale-[1.01] hover:border-white/40 hover:bg-white/10"
							}`}
						>
							<div className="relative z-10">
								<div className="mb-4 flex items-center gap-3">
									<div
										className={`rounded-full p-3 transition-colors ${
											userType === "visitor" ? "bg-indigo-500" : "bg-white/10"
										}`}
									>
										<TrendingUp
											className={`h-6 w-6 ${
												userType === "visitor"
													? "text-white"
													: "text-indigo-300"
											}`}
										/>
									</div>
									<h3 className="font-semibold text-2xl text-white">Explore</h3>
								</div>
								<p className="text-gray-300 text-sm">
									Browse amazing work from creative professionals and get
									inspired
								</p>
							</div>

							{/* Animated background effect */}
							{userType === "visitor" && (
								<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50" />
							)}
						</button>

						{/* Creator Option */}
						<button
							type="button"
							onClick={() => handleUserTypeSelect("creator")}
							className={`group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all duration-300 ${
								userType === "creator"
									? "border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/30"
									: "border-white/20 bg-white/5 hover:scale-[1.01] hover:border-white/40 hover:bg-white/10"
							}`}
						>
							<div className="relative z-10">
								<div className="mb-4 flex items-center gap-3">
									<div
										className={`rounded-full p-3 transition-colors ${
											userType === "creator" ? "bg-purple-500" : "bg-white/10"
										}`}
									>
										<Sparkles
											className={`h-6 w-6 ${
												userType === "creator"
													? "text-white"
													: "text-purple-300"
											}`}
										/>
									</div>
									<h3 className="font-semibold text-2xl text-white">
										Create & Collaborate
									</h3>
								</div>
								<p className="text-gray-300 text-sm">
									Showcase your work, connect with others, and find
									collaboration opportunities
								</p>
							</div>

							{/* Animated background effect with sparkles */}
							{userType === "creator" && (
								<>
									<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-50" />
									<div className="absolute inset-0 overflow-hidden">
										<div className="-right-4 -top-4 absolute h-20 w-20 animate-pulse-slow rounded-full bg-purple-400/20 blur-2xl" />
										<div className="-bottom-4 -left-4 absolute h-20 w-20 animate-pulse-slow rounded-full bg-pink-400/20 blur-2xl [animation-delay:500ms]" />
									</div>
								</>
							)}
						</button>
					</div>

					{/* Continue Button */}
					{userType && (
						<button
							type="button"
							onClick={handleContinueFromWelcome}
							disabled={isAnimating}
							className={`animate-fade-in-delayed-button rounded-full px-12 py-4 font-semibold text-lg text-white transition-all hover:scale-105 disabled:opacity-50 ${
								userType === "creator"
									? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
									: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
							}`}
						>
							Continue
						</button>
					)}
				</div>
			)}

			{/* Role Selection Step */}
			{step === "role-selection" && (
				<div className="space-y-8">
					<div className="text-center">
						<h2 className="mb-2 font-bold text-3xl text-white">
							What's your creative domain?
						</h2>
						<p className="text-gray-300">
							Select up to 3 professional roles that describe you
						</p>
						<p className="mt-2 text-purple-300 text-sm">
							{selectedRoles.length}/3 selected
						</p>
					</div>

					{/* Professional Roles Grid */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{professionalRoles.map((role) => {
							const isSelected = selectedRoles.includes(role.id);
							const isDisabled = !isSelected && selectedRoles.length >= 3;

							return (
								<button
									key={role.id}
									type="button"
									onClick={() => toggleRoleSelection(role.id)}
									disabled={isDisabled}
									className={`group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-200 ${
										isSelected
											? "scale-105 border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30"
											: isDisabled
												? "cursor-not-allowed border-white/10 bg-white/5 opacity-50"
												: "border-white/20 bg-white/5 hover:scale-[1.02] hover:border-purple-400 hover:bg-white/10"
									}`}
								>
									<div className="relative z-10">
										<div className="flex items-start justify-between gap-2 sm:gap-3">
											<div className="flex min-w-0 flex-1 items-center gap-3">
												{/* Icon */}
												{role.icon && (
													<div
														className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
															isSelected
																? "bg-purple-500/30 ring-2 ring-purple-400/50"
																: "bg-white/10 group-hover:bg-white/15"
														}`}
													>
														<span className="text-2xl">{role.icon}</span>
													</div>
												)}
												<div className="min-w-0 flex-1">
													{/* Role name */}
													<h3 className="mb-1 font-semibold text-base text-white">
														{role.name}
													</h3>
													{/* Description */}
													{role.description && (
														<p className="text-gray-400 text-xs leading-relaxed">
															{role.description}
														</p>
													)}
												</div>
											</div>
											{isSelected && (
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500 shadow-lg">
													<svg
														className="h-4 w-4 text-white"
														fill="none"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<title>Selected</title>
														<path d="M5 13l4 4L19 7" />
													</svg>
												</div>
											)}
										</div>
									</div>

									{/* Selection effect */}
									{isSelected && (
										<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
									)}
								</button>
							);
						})}
					</div>

					{/* Continue Button */}
					{selectedRoles.length > 0 && (
						<div className="flex justify-center">
							<button
								type="button"
								onClick={handleContinueFromRoles}
								className="animate-fade-in-delayed-button rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 font-semibold text-lg text-white transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700"
							>
								Continue
							</button>
						</div>
					)}
				</div>
			)}

			{/* Profile Setup Step */}
			{step === "profile-setup" && (
				<div className="mx-auto max-w-2xl space-y-8">
					<div className="text-center">
						<h2 className="mb-2 font-bold text-3xl text-white">
							Complete your profile
						</h2>
						<p className="text-gray-300">
							Help others discover and connect with you
						</p>
					</div>

					<form onSubmit={handleSubmitProfile} className="space-y-6">
						{/* Selected Roles Display */}
						<div className="rounded-xl border border-white/10 bg-white/5 p-6">
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Users className="h-5 w-5 text-purple-400" />
									<h3 className="font-semibold text-white">
										Your Creative Roles
									</h3>
								</div>
								<button
									type="button"
									onClick={() => setStep("role-selection")}
									className="text-purple-400 text-xs hover:text-purple-300"
								>
									Change
								</button>
							</div>
							<div className="flex flex-wrap gap-2.5">
								{professionalRoles
									.filter((role) => selectedRoles.includes(role.id))
									.map((role) => (
										<span
											key={role.id}
											className="flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-purple-300 text-sm"
										>
											{role.icon && (
												<span className="text-base">{role.icon}</span>
											)}
											{role.name}
										</span>
									))}
							</div>
						</div>

						{/* Name Input */}
						<div>
							<label
								htmlFor="name"
								className="mb-2 block font-medium text-gray-200 text-sm"
							>
								Display Name (Optional)
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={`Or we'll use ${username}`}
								maxLength={100}
								className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						</div>

						{/* Bio Input */}
						<div>
							<label
								htmlFor="bio"
								className="mb-2 block font-medium text-gray-200 text-sm"
							>
								Bio (Optional)
							</label>
							<textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell us about yourself and your creative journey..."
								maxLength={500}
								rows={4}
								className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
							<p className="mt-1 text-right text-gray-400 text-xs">
								{bio.length}/500
							</p>
						</div>

						{/* Location Input */}
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
								placeholder="City, Country"
								maxLength={100}
								className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						</div>

						{/* Submit Button */}
						<div className="flex justify-center pt-4">
							<button
								type="submit"
								disabled={isSubmitting}
								className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 font-semibold text-lg text-white transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isSubmitting ? "Creating Profile..." : "Complete Setup"}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
