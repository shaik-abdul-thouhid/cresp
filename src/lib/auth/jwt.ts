import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d"; // 7 days

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
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch {
		return null;
	}
}

export function generateVerificationToken(): string {
	return jwt.sign({ type: "verification" }, JWT_SECRET, { expiresIn: "24h" });
}

export function generateResetPasswordToken(): string {
	return jwt.sign({ type: "reset" }, JWT_SECRET, { expiresIn: "1h" });
}
