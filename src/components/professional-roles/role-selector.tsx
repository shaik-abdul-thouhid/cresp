"use client";

interface ProfessionalRole {
	id: string;
	name: string;
	key: string;
	description: string | null;
	icon: string | null;
}

interface RoleSelectorProps {
	professionalRoles: ProfessionalRole[];
	selectedRoles: string[];
	onRolesChange: (roles: string[]) => void;
	maxSelection?: number;
	showCounter?: boolean;
	lockedRoles?: string[]; // Roles that cannot be deselected
}

export function RoleSelector({
	professionalRoles,
	selectedRoles,
	onRolesChange,
	maxSelection = 3,
	showCounter = true,
	lockedRoles = [],
}: RoleSelectorProps) {
	const toggleRoleSelection = (roleId: string) => {
		const isLocked = lockedRoles.includes(roleId);

		if (selectedRoles.includes(roleId)) {
			// Don't allow deselecting locked roles
			if (isLocked) {
				return;
			}
			onRolesChange(selectedRoles.filter((id) => id !== roleId));
		} else if (selectedRoles.length < maxSelection) {
			onRolesChange([...selectedRoles, roleId]);
		}
	};

	return (
		<div className="space-y-6">
			{showCounter && (
				<div className="text-center">
					<p className="font-medium text-purple-600 text-sm">
						{selectedRoles.length}/{maxSelection} selected
					</p>
					{lockedRoles.length > 0 && (
						<p className="mt-2 flex items-center justify-center gap-1.5 text-gray-500 text-xs">
							<svg
								className="h-3.5 w-3.5"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Lock icon</title>
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0110 0v4" />
							</svg>
							<span>
								{lockedRoles.length} existing role
								{lockedRoles.length > 1 ? "s" : ""} cannot be removed
							</span>
						</p>
					)}
				</div>
			)}

			{/* Professional Roles Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{professionalRoles.map((role) => {
					const isSelected = selectedRoles.includes(role.id);
					const isLocked = lockedRoles.includes(role.id);
					const isDisabled =
						!isSelected && selectedRoles.length >= maxSelection;

					return (
						<button
							key={role.id}
							type="button"
							onClick={() => toggleRoleSelection(role.id)}
							disabled={isDisabled}
							className={`group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-200 ${
								isSelected && isLocked
									? "scale-105 cursor-default border-purple-600 bg-purple-100 shadow-lg ring-2 ring-purple-300"
									: isSelected
										? "scale-105 border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200"
										: isDisabled
											? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
											: "border-gray-200 bg-white hover:scale-[1.02] hover:border-purple-300 hover:bg-purple-50/50"
							}`}
						>
							<div className="relative z-10">
								<div className="flex items-start justify-between gap-2 sm:gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-3">
										{/* Icon */}
										{role.icon && (
											<div
												className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
													isSelected
														? "bg-purple-100 ring-2 ring-purple-400/50"
														: "bg-gray-100 group-hover:bg-purple-100"
												}`}
											>
												<span className="text-2xl">{role.icon}</span>
											</div>
										)}
										<div className="min-w-0 flex-1">
											{/* Role name */}
											<h3
												className={`mb-1 font-semibold text-base ${
													isSelected ? "text-purple-900" : "text-gray-900"
												}`}
											>
												{role.name}
											</h3>
											{/* Description */}
											{role.description && (
												<p className="line-clamp-2 text-gray-600 text-xs leading-relaxed">
													{role.description}
												</p>
											)}
										</div>
									</div>
									{isSelected && (
										<div
											className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-lg ${
												isLocked ? "bg-purple-600" : "bg-purple-500"
											}`}
										>
											{isLocked ? (
												<svg
													className="h-3.5 w-3.5 text-white"
													fill="none"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<title>Locked</title>
													<rect
														x="3"
														y="11"
														width="18"
														height="11"
														rx="2"
														ry="2"
													/>
													<path d="M7 11V7a5 5 0 0110 0v4" />
												</svg>
											) : (
												<svg
													className="h-4 w-4 text-white"
													fill="none"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<title>Selected</title>
													<path d="M5 13l4 4L19 7" />
												</svg>
											)}
										</div>
									)}
								</div>
							</div>

							{/* Selection effect */}
							{isSelected && (
								<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
