// ============================================
// MAILJET EMAIL PROVIDER
// ============================================

import Mailjet from "node-mailjet";
import type {
	EmailAddress,
	EmailOptions,
	EmailProvider,
	EmailResponse,
} from "../types";

type MailjetClient = ReturnType<typeof Mailjet.apiConnect>;

export class MailjetProvider implements EmailProvider {
	name = "Mailjet";
	private client: MailjetClient | null = null;
	private defaultFrom: EmailAddress;

	constructor(
		private apiKey: string,
		private secretKey: string,
		defaultFrom: EmailAddress,
	) {
		this.defaultFrom = defaultFrom;

		// Only initialize if credentials are valid
		if (this.isConfigured) {
			this.client = Mailjet.apiConnect(this.apiKey, this.secretKey);
		}
	}

	get isConfigured(): boolean {
		return Boolean(this.apiKey && this.secretKey);
	}

	async sendEmail(options: EmailOptions): Promise<EmailResponse> {
		// Check if Mailjet is configured
		if (!this.isConfigured || !this.client) {
			const error = new Error("Mailjet is not configured");
			console.warn(
				"Mailjet API credentials not configured. Email would be sent to:",
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

			// Format to addresses
			const toAddresses = this.formatAddresses(options.to);

			// Format optional addresses
			const ccAddresses = options.cc ? this.formatAddresses(options.cc) : [];
			const bccAddresses = options.bcc ? this.formatAddresses(options.bcc) : [];

			// Build message
			const message: Record<string, unknown> = {
				From: {
					Email: from.email,
					Name: from.name || "",
				},
				To: toAddresses,
				Subject: options.subject,
				HTMLPart: options.html,
			};

			// Add optional fields
			if (options.text) {
				message.TextPart = options.text;
			}
			if (ccAddresses.length > 0) {
				message.Cc = ccAddresses;
			}
			if (bccAddresses.length > 0) {
				message.Bcc = bccAddresses;
			}
			if (options.replyTo) {
				message.ReplyTo = {
					Email: options.replyTo.email,
					Name: options.replyTo.name || "",
				};
			}

			// Send email
			const result = await this.client.post("send", { version: "v3.1" }).request({
				Messages: [message],
			});

			// Extract message ID from response
			const body = result.body as {
				Messages?: Array<{
					To?: Array<{ MessageID?: number | string }>;
				}>;
			};
			const messageId =
				body.Messages?.[0]?.To?.[0]?.MessageID?.toString() || "unknown";

			return {
				success: true,
				messageId,
			};
		} catch (error) {
			console.error("Mailjet Error:", error);
			return {
				success: false,
				error,
			};
		}
	}

	private formatAddresses(
		addresses: EmailAddress | EmailAddress[],
	): Array<{ Email: string; Name: string }> {
		const addressArray = Array.isArray(addresses) ? addresses : [addresses];
		return addressArray.map((addr) => ({
			Email: addr.email,
			Name: addr.name || "",
		}));
	}
}

