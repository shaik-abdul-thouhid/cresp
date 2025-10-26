import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d"; // 7 days

// Warn if using default secret (security risk!)
if (!process.env.JWT_SECRET || JWT_SECRET === "your-secret-key-change-this") {
	console.warn(
		"⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for production!"
	);
}

export interface JWTPayload {
	userId: string;
	email: string;
	username: string;
	onboardingCompleted: boolean;
}

export function generateToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		return decoded;
	} catch (err: unknown) {
		const error = err as Error;

		return null;
	}
}

export function generateVerificationToken(): string {
	return jwt.sign({ type: "verification" }, JWT_SECRET, { expiresIn: "24h" });
}

export function generateResetPasswordToken(): string {
	return jwt.sign({ type: "reset" }, JWT_SECRET, { expiresIn: "1h" });
}
