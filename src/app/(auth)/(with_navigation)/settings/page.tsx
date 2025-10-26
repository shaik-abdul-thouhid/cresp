import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "~/lib/auth/get-user";

export default async function SettingsPage() {
	// OPTIMIZED: Use combined query instead of getCurrentUser() + getFullUserData()
	// Also cached by React cache(), so if layout already called it, no extra query
	// biome-ignore lint/suspicious/noImplicitAnyLet: Type will be inferred from try-catch assignment
	let authData;
	try {
		authData = await getAuthenticatedUser();
	} catch (error) {
		console.error("Failed to fetch user data:", error);
		throw new Error("Unable to load settings. Please try again later.");
	}

	if (!authData || !authData.user) {
		redirect("/login");
	}

	const fullUser = authData.user;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl text-gray-900">Settings</h1>
				<p className="text-gray-600">
					Manage your account settings and preferences
				</p>
			</div>

			{/* Profile Settings */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-bold text-gray-900 text-xl">
					Profile Information
				</h2>
				<div className="space-y-4">
					{[
						{ label: "Name", value: fullUser.name ?? "Not set" },
						{ label: "Username", value: `@${fullUser.username}` },
						{ label: "Email", value: fullUser.email },
						{ label: "Bio", value: fullUser.bio ?? "No bio added yet" },
					].map((field) => (
						<div key={field.label}>
							<div className="mb-1 block font-medium text-gray-700 text-sm">
								{field.label}
							</div>
							<p
								className={
									field.label === "Bio" ? "text-gray-600" : "text-gray-900"
								}
							>
								{field.value}
							</p>
						</div>
					))}
				</div>
				<div className="mt-6">
					<button
						type="button"
						className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
					>
						Edit Profile
					</button>
				</div>
			</div>

			{/* Account Settings */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-bold text-gray-900 text-xl">
					Account Settings
				</h2>
				<div className="space-y-4">
					{[
						{
							title: "Privacy",
							description: "Control who can see your profile and posts",
						},
						{
							title: "Notifications",
							description: "Manage your notification preferences",
						},
					].map((setting) => (
						<div key={setting.title}>
							<h3 className="mb-2 font-medium text-gray-900">
								{setting.title}
							</h3>
							<p className="text-gray-600 text-sm">{setting.description}</p>
						</div>
					))}
				</div>
			</div>

			{/* Danger Zone */}
			<div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
				<h2 className="mb-2 font-bold text-red-900 text-xl">Danger Zone</h2>
				<p className="mb-4 text-red-700 text-sm">
					Irreversible actions for your account
				</p>
				<button
					type="button"
					className="rounded-lg border-2 border-red-600 bg-white px-4 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50"
				>
					Delete Account
				</button>
			</div>
		</div>
	);
}
