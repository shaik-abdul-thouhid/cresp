import Link from "next/link";
import { ForgotPasswordForm } from "~/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<>
			{/* Page title */}
			<h2 className="mb-3 text-center font-bold text-3xl text-white">
				Forgot Password?
			</h2>
			<p className="mb-8 text-center text-gray-300">
				No worries! We'll send you reset instructions.
			</p>

			{/* Form card */}
			<div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md">
				<ForgotPasswordForm />

				<div className="mt-6 text-center">
					<Link
						href="/login"
						className="text-purple-300 text-sm hover:text-purple-200"
					>
						← Back to login
					</Link>
				</div>
			</div>
		</>
	);
}
