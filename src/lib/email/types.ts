// ============================================
// EMAIL PROVIDER TYPES - Provider-agnostic interface
// ============================================

export interface EmailAddress {
	email: string;
	name?: string;
}

export interface EmailOptions {
	to: EmailAddress | EmailAddress[];
	from?: EmailAddress;
	subject: string;
	html: string;
	text?: string;
	cc?: EmailAddress | EmailAddress[];
	bcc?: EmailAddress | EmailAddress[];
	replyTo?: EmailAddress;
}

export interface EmailResponse {
	success: boolean;
	messageId?: string;
	error?: unknown;
}

export interface EmailProvider {
	name: string;
	isConfigured: boolean;
	sendEmail(options: EmailOptions): Promise<EmailResponse>;
}

export type EmailProviderType = "mailjet" | "sendgrid" | "console";

