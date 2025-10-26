import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export function validatePassword(password: string): {
	valid: boolean;
	error?: string;
} {
	if (password.length < 8) {
		return { valid: false, error: "Password must be at least 8 characters long" };
	}

	if (password.length > 128) {
		return { valid: false, error: "Password must be less than 128 characters" };
	}

	// At least one uppercase letter
	if (!/[A-Z]/.test(password)) {
		return {
			valid: false,
			error: "Password must contain at least one uppercase letter",
		};
	}

	// At least one lowercase letter
	if (!/[a-z]/.test(password)) {
		return {
			valid: false,
			error: "Password must contain at least one lowercase letter",
		};
	}

	// At least one number
	if (!/[0-9]/.test(password)) {
		return { valid: false, error: "Password must contain at least one number" };
	}

	return { valid: true };
}

