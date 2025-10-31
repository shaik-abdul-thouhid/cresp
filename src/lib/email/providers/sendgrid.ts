// ============================================
// SENDGRID EMAIL PROVIDER (Optional - for easy switching)
// ============================================

import sgMail from "@sendgrid/mail";
import type {
	EmailAddress,
	EmailOptions,
	EmailProvider,
	EmailResponse,
} from "../types";

export class SendGridProvider implements EmailProvider {
	name = "SendGrid";
	private defaultFrom: EmailAddress;

	constructor(
		private apiKey: string,
		defaultFrom: EmailAddress,
	) {
		this.defaultFrom = defaultFrom;

		// Only set API key if valid
		if (this.isConfigured) {
			sgMail.setApiKey(this.apiKey);
		}
	}

	get isConfigured(): boolean {
		return Boolean(this.apiKey && this.apiKey.startsWith("SG."));
	}

	async sendEmail(options: EmailOptions): Promise<EmailResponse> {
		// Check if SendGrid is configured
		if (!this.isConfigured) {
			const error = new Error("SendGrid is not configured");
			console.warn(
				"SendGrid API key not configured. Email would be sent to:",
				Array.isArray(options.to)
					? options.to.map((t) => t.email).join(", ")
					: options.to.email,
			);

			// In development, simulate success
			if (process.env.NODE_ENV !== "production") {
				return { success: true, messageId: "dev-mode-no-email" };
			}

			return { success: false, error };
		}

		try {
			// Format from address
			const from = options.from || this.defaultFrom;

			// Build message
			const message: Record<string, unknown> = {
				from: {
					email: from.email,
					name: from.name,
				},
				subject: options.subject,
				html: options.html,
			};

			// Format to addresses
			if (Array.isArray(options.to)) {
				message.personalizations = [
					{
						to: options.to.map((addr) => ({
							email: addr.email,
							name: addr.name,
						})),
					},
				];
			} else {
				message.to = {
					email: options.to.email,
					name: options.to.name,
				};
			}

			// Add optional fields
			if (options.text) {
				message.text = options.text;
			}
			if (options.cc) {
				const ccAddrs = Array.isArray(options.cc) ? options.cc : [options.cc];
				message.cc = ccAddrs.map((addr) => ({
					email: addr.email,
					name: addr.name,
				}));
			}
			if (options.bcc) {
				const bccAddrs = Array.isArray(options.bcc)
					? options.bcc
					: [options.bcc];
				message.bcc = bccAddrs.map((addr) => ({
					email: addr.email,
					name: addr.name,
				}));
			}
			if (options.replyTo) {
				message.replyTo = {
					email: options.replyTo.email,
					name: options.replyTo.name,
				};
			}

			const [response] = await sgMail.send(message as never);

			return {
				success: true,
				messageId: response.headers?.["x-message-id"]?.toString(),
			};
		} catch (error) {
			console.error("SendGrid Error:", error);
			return {
				success: false,
				error,
			};
		}
	}
}

