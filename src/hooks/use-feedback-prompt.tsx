"use client";

import { useState } from "react";
import { FeedbackModal } from "~/components/feedback/feedback-modal";

interface FeedbackPromptConfig {
	trigger: string;
	feedbackType: string;
	title: string;
	question: string;
}

export function useFeedbackPrompt() {
	const [config, setConfig] = useState<FeedbackPromptConfig | null>(null);
	const [showModal, setShowModal] = useState(false);

	const checkAndShowFeedback = async (promptConfig: FeedbackPromptConfig) => {
		try {
			// Check cooldown
			const response = await fetch(
				`/api/feedback/check-cooldown?trigger=${encodeURIComponent(promptConfig.trigger)}`
			);

			if (!response.ok) {
				// User not logged in or error - skip quietly
				return;
			}

			const data = await response.json();

			if (data.canShow) {
				// Log that we're showing the prompt
				await fetch("/api/feedback/log-shown", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ trigger: promptConfig.trigger }),
				});

				// Show modal
				setConfig(promptConfig);
				setShowModal(true);
			}
		} catch (error) {
			console.error("Error checking feedback cooldown:", error);
			// Fail silently - don't annoy user with errors
		}
	};

	const handleClose = () => {
		setShowModal(false);
		setConfig(null);
	};

	const FeedbackPrompt = config && showModal ? (
		<FeedbackModal
			trigger={config.trigger}
			feedbackType={config.feedbackType}
			title={config.title}
			question={config.question}
			onClose={handleClose}
		/>
	) : null;

	return {
		checkAndShowFeedback,
		FeedbackPrompt,
	};
}

