import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "~/components/ui/custom-toasts";

// Types for API requests/responses
interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	message: string;
	userId: string;
	onboardingCompleted: boolean;
	error?: string;
	needsVerification?: boolean;
	verificationToken?: string;
}

interface SignupRequest {
	username: string;
	email: string;
	password: string;
}

interface SignupResponse {
	message: string;
	userId?: string;
	verificationToken?: string;
	needsVerification?: boolean;
	error?: string;
}

interface ForgotPasswordRequest {
	email: string;
}

interface ForgotPasswordResponse {
	message: string;
	error?: string;
}

interface ResetPasswordRequest {
	token: string;
	password: string;
}

interface ResetPasswordResponse {
	message: string;
	error?: string;
}

// Login mutation
export function useLogin(returnUrl?: string) {
	return useMutation({
		mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw result;
			}

			return result;
		},
		onSuccess: (data) => {
			if (!data.needsVerification) {
				// Navigate to appropriate page
				// The new page will load with the updated auth cookie

				// Priority: returnUrl > onboarding check > default (feed)
				if (returnUrl) {
					window.location.href = returnUrl;
				} else if (data.onboardingCompleted) {
					window.location.href = "/feed";
				} else {
					window.location.href = "/journey";
				}
			}
		},
	});
}

// Signup mutation
export function useSignup() {
	return useMutation({
		mutationFn: async (data: SignupRequest): Promise<SignupResponse> => {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw result;
			}

			return result;
		},
		onSuccess: () => {
			toast.custom(() => (
				<SuccessToast
					title="Account created!"
					message="Please check your email for verification"
				/>
			));
		},
		onError: (error: SignupResponse) => {
			if (!error.needsVerification) {
				toast.custom(() => (
					<ErrorToast
						title="Signup failed"
						message={error.error || "Please try again"}
					/>
				));
			}
		},
	});
}

// Forgot password mutation
export function useForgotPassword() {
	return useMutation({
		mutationFn: async (
			data: ForgotPasswordRequest,
		): Promise<ForgotPasswordResponse> => {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw result;
			}

			return result;
		},
		onSuccess: () => {
			toast.custom(() => (
				<SuccessToast
					title="Reset link sent"
					message="Check your email for password reset instructions"
				/>
			));
		},
		onError: (error: ForgotPasswordResponse) => {
			toast.custom(() => (
				<ErrorToast
					title="Request failed"
					message={error.error || "Please try again"}
				/>
			));
		},
	});
}

// Reset password mutation
export function useResetPassword() {
	const router = useRouter();

	return useMutation({
		mutationFn: async (
			data: ResetPasswordRequest,
		): Promise<ResetPasswordResponse> => {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw result;
			}

			return result;
		},
		onSuccess: () => {
			toast.custom(() => (
				<SuccessToast
					title="Password reset successful"
					message="Redirecting to login..."
				/>
			));
			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		},
		onError: (error: ResetPasswordResponse) => {
			toast.custom(() => (
				<ErrorToast
					title="Reset failed"
					message={error.error || "Please try again"}
				/>
			));
		},
	});
}

// Logout mutation
export function useLogout() {
	return useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Logout failed");
			}

			return response.json();
		},
		onSuccess: () => {
			// Full page reload to clear all client state
			window.location.href = "/login";
		},
	});
}
