import { Resend } from "resend";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Sends a magic link email to the user
 * In development: logs to console
 * In production: sends via Resend API
 */
export async function sendMagicLinkEmail({
	email,
	token,
	url,
}: {
	email: string;
	token: string;
	url: string;
}): Promise<void> {
	if (isDevelopment) {
		// Development: Log to console for easy testing
		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("📧 MAGIC LINK EMAIL (Development Mode)");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log(`To: ${email}`);
		console.log(`Token: ${token}`);
		console.log(`URL: ${url}`);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
		return;
	}

	// Production: Send via Resend
	const resendApiKey = process.env.RESEND_API_KEY;
	const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

	if (!resendApiKey) {
		console.error(
			"RESEND_API_KEY is not set. Cannot send magic link email."
		);
		throw new Error("Email service not configured");
	}

	const resend = new Resend(resendApiKey);

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.CORS_ORIGIN || "";
	const appName = "Acme Inc.";

	try {
		await resend.emails.send({
			from: fromEmail,
			to: email,
			subject: `Sign in to ${appName}`,
			html: `
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
					</head>
					<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #2563eb; margin: 0;">${appName}</h1>
						</div>
						<div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
							<h2 style="margin-top: 0; color: #111827;">Sign in to your account</h2>
							<p style="color: #6b7280; margin-bottom: 30px;">
								Click the button below to sign in to your account. This link will expire in 5 minutes.
							</p>
							<div style="text-align: center; margin: 30px 0;">
								<a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
									Sign in to ${appName}
								</a>
							</div>
							<p style="color: #9ca3af; font-size: 14px; margin-top: 30px; margin-bottom: 0;">
								If the button doesn't work, copy and paste this link into your browser:
							</p>
							<p style="color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 10px;">
								${url}
							</p>
						</div>
						<div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
							<p style="margin: 0;">If you didn't request this email, you can safely ignore it.</p>
						</div>
					</body>
				</html>
			`,
			text: `
Sign in to ${appName}

Click the link below to sign in to your account. This link will expire in 5 minutes.

${url}

If you didn't request this email, you can safely ignore it.
			`.trim(),
		});
	} catch (error) {
		console.error("Failed to send magic link email:", error);
		throw new Error("Failed to send magic link email");
	}
}

