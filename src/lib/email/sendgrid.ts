import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@cresp.app";
// Use NEXT_PUBLIC_APP_URL for client-accessible URL, fallback to NEXTAUTH_URL or localhost
const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ||
	process.env.NEXTAUTH_URL ||
	"http://localhost:3000";

sgMail.setApiKey(SENDGRID_API_KEY);

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

async function sendEmail({ to, subject, html, text }: EmailOptions) {
	try {
		await sgMail.send({
			to,
			from: FROM_EMAIL,
			subject,
			html,
			text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
		});
		return { success: true };
	} catch (error) {
		console.error("SendGrid Error:", error);
		return { success: false, error };
	}
}

export async function sendVerificationEmail(
	email: string,
	username: string,
	token: string
) {
	const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Cresp</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Welcome to the Creative Community</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hi ${username}! 👋</h2>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for Cresp! We're excited to have you join our community of creative professionals.
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                To get started, please verify your email address by clicking the button below:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                Cresp - Where Creativity Meets Collaboration
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px;">
                🎬 Showcase · ⭐ Recognition · 🤝 Collaboration
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

	return sendEmail({
		to: email,
		subject: "Verify your email address - Cresp",
		html,
	});
}

export async function sendPasswordResetEmail(
	email: string,
	username: string,
	token: string
) {
	const resetUrl = `${APP_URL}/reset-password?token=${token}`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Cresp</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Password Reset Request</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hi ${username}! 🔒</h2>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Cresp account.
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              <div style="margin: 30px 0; padding: 20px; background-color: #fff8dc; border-left: 4px solid #ffa500; border-radius: 4px;">
                <p style="margin: 0; color: #cc7700; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                Cresp - Where Creativity Meets Collaboration
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px;">
                🎬 Showcase · ⭐ Recognition · 🤝 Collaboration
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

	return sendEmail({
		to: email,
		subject: "Reset your password - Cresp",
		html,
	});
}

export async function sendWelcomeEmail(email: string, username: string) {
	const loginUrl = `${APP_URL}/login`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cresp!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to Cresp! 🎉</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hey ${username}! 👋</h2>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Your email has been verified! You're now part of the Cresp community.
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Here's what you can do on Cresp:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 16px;"><strong>🎬 Showcase</strong> your creative work</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 16px;"><strong>⭐ Gain recognition</strong> from peers</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 6px;">
                    <p style="margin: 0; color: #333333; font-size: 16px;"><strong>🤝 Collaborate</strong> on amazing projects</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Get Started</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                Cresp - Where Creativity Meets Collaboration
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px;">
                Need help? Reply to this email or visit our help center
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

	return sendEmail({
		to: email,
		subject: "Welcome to Cresp! 🎉",
		html,
	});
}
