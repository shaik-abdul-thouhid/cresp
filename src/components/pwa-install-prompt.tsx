"use client";

import { Check, Smartphone, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		// Check if permanently dismissed
		const permanentlyDismissed = localStorage.getItem("pwa-prompt-never-show");
		if (permanentlyDismissed === "true") {
			return;
		}

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			// Show prompt after 5 minutes (300000ms)
			setTimeout(() => {
				setShowPrompt(true);
			}, 300000);
		};

		window.addEventListener("beforeinstallprompt", handler);

		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) {
			return;
		}

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === "accepted") {
			console.log("User accepted the install prompt");
			// Mark as permanently dismissed after successful install
			localStorage.setItem("pwa-prompt-never-show", "true");
		}

		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		// Permanently dismiss - never show again
		localStorage.setItem("pwa-prompt-never-show", "true");
	};

	const handleNotNow = () => {
		// Just hide for this session, don't save to localStorage
		setShowPrompt(false);
	};

	if (!showPrompt || !deferredPrompt) {
		return null;
	}

	return (
		<div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md animate-slide-up sm:right-4 sm:left-auto">
			<div className="overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl">
				<div className="p-6">
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
								<Smartphone className="h-6 w-6 text-white" />
							</div>
							<div>
								<h3 className="font-bold text-white">Install Cresp</h3>
								<p className="text-purple-100 text-sm">
									Get the full app experience
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={handleDismiss}
							className="text-white/70 hover:text-white"
							aria-label="Dismiss"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="space-y-2 text-purple-100 text-sm">
						<div className="flex items-center gap-2">
							<Check className="h-4 w-4" />
							<span>Works offline</span>
						</div>
						<div className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							<span>Faster loading</span>
						</div>
						<div className="flex items-center gap-2">
							<Smartphone className="h-4 w-4" />
							<span>Home screen access</span>
						</div>
					</div>

					<div className="mt-4 flex gap-3">
						<button
							type="button"
							onClick={handleNotNow}
							className="flex-1 rounded-lg border border-white/20 py-2 font-medium text-white transition-all hover:bg-white/10"
						>
							Not now
						</button>
						<button
							type="button"
							onClick={handleInstallClick}
							className="flex-1 rounded-lg bg-white py-2 font-semibold text-purple-600 transition-all hover:bg-purple-50"
						>
							Install
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
