export default function MessagesPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h1 className="mb-2 font-bold text-3xl text-gray-900">Messages</h1>
				<p className="text-gray-600">Connect with other creative professionals</p>
			</div>

			{/* Messages Layout */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Conversations List */}
				<div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
					<h2 className="mb-4 font-semibold text-lg">Conversations</h2>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-300 hover:bg-purple-50"
							>
								<div className="mb-1 flex items-center justify-between">
									<h3 className="font-semibold text-gray-900 text-sm">
										User {i}
									</h3>
									<span className="text-gray-500 text-xs">2h ago</span>
								</div>
								<p className="line-clamp-1 text-gray-600 text-xs">
									Last message preview...
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Chat Area */}
				<div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
					<div className="flex h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
						<div className="text-center">
							<div className="mb-4 text-6xl">💬</div>
							<p className="mb-2 text-gray-500 text-lg">No conversation selected</p>
							<p className="text-gray-400 text-sm">
								Choose a conversation or start a new one
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

