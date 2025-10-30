"use client";

import { Flag, MoreVertical } from "lucide-react";
import { useState } from "react";
import { ReportUserModal } from "./report-user-modal";

export function ProfileActionsClient({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	const [showMenu, setShowMenu] = useState(false);
	const [showReportModal, setShowReportModal] = useState(false);

	return (
		<>
			<div className="relative">
				<button
					type="button"
					onClick={() => setShowMenu(!showMenu)}
					className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50"
					aria-label="More options"
				>
					<MoreVertical className="h-5 w-5" />
				</button>

				{/* Dropdown */}
				{showMenu && (
					<>
						{/* Backdrop */}
						<button
							type="button"
							onClick={() => setShowMenu(false)}
							className="fixed inset-0 z-10"
							aria-label="Close menu"
						/>

						{/* Menu */}
						<div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
							<button
								type="button"
								onClick={() => {
									setShowMenu(false);
									setShowReportModal(true);
								}}
								className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50"
							>
								<Flag className="h-4 w-4 text-red-600" />
								<span>Report User</span>
							</button>
						</div>
					</>
				)}
			</div>

			{/* Report Modal */}
			<ReportUserModal
				userId={userId}
				username={username}
				isOpen={showReportModal}
				onClose={() => setShowReportModal(false)}
			/>
		</>
	);
}

