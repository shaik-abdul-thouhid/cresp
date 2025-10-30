"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "~/components/modals/confirmation-modal";
import { CongratulationsModal } from "~/components/modals/congratulations-modal";
import { RoleSelector } from "~/components/professional-roles/role-selector";
import { ErrorToast } from "~/components/ui/custom-toasts";
import {
	fetchAllProfessionalRoles,
	fetchCurrentUser,
	fetchUserProfessionalRoles,
	updateUserProfessionalRoles,
} from "~/lib/api/queries/user";

export default function ProfessionSelectionPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const userId = params.userId as string;

	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [initialRoles, setInitialRoles] = useState<string[]>([]);
	const [showCongratulations, setShowCongratulations] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);

	// Query: Fetch current user
	const {
		data: currentUser,
		isLoading: isLoadingUser,
		error: userError,
	} = useQuery({
		queryKey: ["currentUser"],
		queryFn: fetchCurrentUser,
		retry: 1,
	});

	// Query: Fetch all professional roles
	const {
		data: allRolesData,
		isLoading: isLoadingRoles,
		error: rolesError,
	} = useQuery({
		queryKey: ["professionalRoles"],
		queryFn: fetchAllProfessionalRoles,
		retry: 1,
	});

	// Query: Fetch user's current professional roles
	const {
		data: userRolesData,
		isLoading: isLoadingUserRoles,
		error: userRolesError,
	} = useQuery({
		queryKey: ["userProfessionalRoles"],
		queryFn: fetchUserProfessionalRoles,
		retry: 1,
	});

	// Mutation: Update professional roles
	const updateRolesMutation = useMutation({
		mutationFn: updateUserProfessionalRoles,
		onSuccess: () => {
			// Invalidate and refetch user roles
			queryClient.invalidateQueries({ queryKey: ["userProfessionalRoles"] });

			// Update initial roles to reflect saved state
			setInitialRoles(selectedRoles);

			// Show congratulations modal
			setShowCongratulations(true);

			// Redirect to user profile after modal
			setTimeout(() => {
				router.push(`/user/${userId}`);
			}, 3000);
		},
		onError: (error: Error) => {
			toast.custom(() => (
				<ErrorToast
					title="Failed to Save"
					message={error.message || "Please try again"}
				/>
			));
		},
	});

	// Set selected roles when user roles data is loaded
	useEffect(() => {
		if (userRolesData?.roles) {
			const currentRoleIds = userRolesData.roles.map((r) => r.id);
			setSelectedRoles(currentRoleIds);
			setInitialRoles(currentRoleIds);
		}
	}, [userRolesData]);

	// Handle save - show confirmation first
	const handleSave = () => {
		if (selectedRoles.length === 0) {
			toast.custom(() => (
				<ErrorToast
					title="No Roles Selected"
					message="Please select at least one professional role"
				/>
			));
			return;
		}

		// Show confirmation modal
		setShowConfirmation(true);
	};

	// Handle confirmed save
	const handleConfirmSave = () => {
		updateRolesMutation.mutate(selectedRoles);
		setShowConfirmation(false);
	};

	// Check if there are changes
	const hasChanges =
		JSON.stringify(selectedRoles.sort()) !==
		JSON.stringify(initialRoles.sort());

	// Combined loading state
	const isLoading = isLoadingUser || isLoadingRoles || isLoadingUserRoles;

	// Check for authorization error
	const authError =
		currentUser && currentUser.id !== userId
			? "You can only edit your own professional roles"
			: null;

	// Combined error state
	const error =
		authError ||
		(userError instanceof Error ? userError.message : null) ||
		(rolesError instanceof Error ? rolesError.message : null) ||
		(userRolesError instanceof Error ? userRolesError.message : null);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
					<p className="text-gray-600">Loading professional roles...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center px-4">
				<div className="max-w-md text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						<svg
							className="h-8 w-8 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Error icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="mb-2 font-bold text-gray-900 text-xl">
						{authError ? "Access Denied" : "Error Loading Data"}
					</h2>
					<p className="mb-6 text-gray-600">{error}</p>
					<Link
						href="/feed"
						className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
					>
						<ArrowLeft className="h-4 w-4" />
						Go to Feed
					</Link>
				</div>
			</div>
		);
	}

	const allRoles = allRolesData?.roles || [];

	// Debug logging
	useEffect(() => {
		console.log("Debug - All Roles Data:", allRolesData);
		console.log("Debug - All Roles Array:", allRoles);
		console.log("Debug - Selected Roles:", selectedRoles);
		console.log("Debug - Current User:", currentUser);
	}, [allRolesData, allRoles, selectedRoles, currentUser]);

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Link
					href="/post/create"
					className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Link>
				<h1 className="mb-2 font-bold text-3xl text-gray-900">
					Select Your Professional Roles
				</h1>
				<p className="text-gray-600">
					Choose up to 3 roles that best describe your creative expertise
				</p>
			</div>

			{/* Role Selector */}
			<div className="mb-8">
				{allRoles.length === 0 ? (
					<div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
						<p className="text-gray-600">No professional roles available</p>
						<p className="mt-2 text-gray-500 text-sm">
							Please contact support if this issue persists
						</p>
					</div>
				) : (
					<RoleSelector
						professionalRoles={allRoles}
						selectedRoles={selectedRoles}
						onRolesChange={setSelectedRoles}
						maxSelection={3}
						showCounter={true}
						lockedRoles={initialRoles}
					/>
				)}
			</div>

			{/* Action Buttons */}
			<div className="sticky bottom-0 border-gray-200 border-t bg-white py-4">
				<div className="flex items-center justify-between gap-4">
					<p className="text-gray-600 text-sm">
						{selectedRoles.length === 0
							? "Select at least 1 role to continue"
							: `${selectedRoles.length} role${selectedRoles.length === 1 ? "" : "s"} selected`}
					</p>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={
								updateRolesMutation.isPending ||
								selectedRoles.length === 0 ||
								!hasChanges
							}
							className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{updateRolesMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									Save Roles
								</>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={showConfirmation}
				onClose={() => setShowConfirmation(false)}
				onConfirm={handleConfirmSave}
				title="Update Professional Roles?"
				message="This action will update your professional roles. Please note that existing roles cannot be removed, only new ones can be added. Do you want to continue?"
				confirmText="Yes, Update Roles"
				cancelText="Cancel"
				isDestructive={false}
				isLoading={updateRolesMutation.isPending}
			/>

			{/* Congratulations Modal */}
			<CongratulationsModal
				isOpen={showCongratulations}
				onClose={() => {
					setShowCongratulations(false);
					router.push(`/user/${userId}`);
				}}
				title="Roles Updated! 🎉"
				message="Your professional roles have been saved successfully. Get ready to showcase your amazing work!"
				autoCloseMs={5000}
			/>
		</div>
	);
}
