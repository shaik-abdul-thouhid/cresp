import bcrypt from "bcryptjs";

/**
 * Generate a bcrypt hash for admin user password
 * Usage: bun run scripts/generate-admin-hash.ts <password>
 */

const password = process.argv[2];

if (!password) {
	console.error("❌ Please provide a password as argument");
	console.log("Usage: bun run scripts/generate-admin-hash.ts <password>");
	process.exit(1);
}

async function generateHash() {
	const hash = await bcrypt.hash(password, 12);
	console.log("\n✅ Password hash generated successfully!\n");
	console.log("Password:", password);
	console.log("Hash:", hash);
	console.log("\n📝 Copy the hash above and use it in your seed.sql file\n");
}

generateHash().catch(console.error);
