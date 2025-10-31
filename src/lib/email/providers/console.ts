// ============================================
// CONSOLE EMAIL PROVIDER (Development/Testing)
// ============================================

import type {
	EmailOptions,
	EmailProvider,
	EmailResponse
} from "../types";

export class ConsoleProvider implements EmailProvider {
	name = "Console (Dev Mode)";
	isConfigured = true;

	async sendEmail(options: EmailOptions): Promise<EmailResponse> {
		console.log("\n" + "=".repeat(60));
		console.log("📧 EMAIL (Console Provider - Development Mode)");
		console.log("=".repeat(60));
		console.log("From:", options.from?.email || "default");
		console.log(
			"To:",
			Array.isArray(options.to)
				? options.to.map((t) => t.email).join(", ")
				: options.to.email,
		);
		if (options.cc) {
			console.log(
				"CC:",
				Array.isArray(options.cc)
					? options.cc.map((c) => c.email).join(", ")
					: options.cc.email,
			);
		}
		if (options.bcc) {
			console.log(
				"BCC:",
				Array.isArray(options.bcc)
					? options.bcc.map((b) => b.email).join(", ")
					: options.bcc.email,
			);
		}
		console.log("Subject:", options.subject);
		console.log("-".repeat(60));
		if (options.text) {
			console.log("Text Content:");
			console.log(options.text);
			console.log("-".repeat(60));
		}
		console.log("HTML Content:");
		console.log(options.html.substring(0, 200) + "...");
		console.log("=".repeat(60) + "\n");

		return {
			success: true,
			messageId: `console-${Date.now()}`,
		};
	}
}

