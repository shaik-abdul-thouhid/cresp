export default function CollaborationsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h1 className="mb-2 font-bold text-3xl text-gray-900">
					Collaborations
				</h1>
				<p className="text-gray-600">
					Find partners for your next creative project
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-3">
				{[
					{
						icon: "🤝",
						count: 0,
						label: "Active Collaborations",
						gradient: "from-blue-500 to-cyan-500",
						textColor: "text-blue-100",
					},
					{
						icon: "📨",
						count: 0,
						label: "Pending Requests",
						gradient: "from-purple-500 to-pink-500",
						textColor: "text-purple-100",
					},
					{
						icon: "✅",
						count: 0,
						label: "Completed Projects",
						gradient: "from-orange-500 to-red-500",
						textColor: "text-orange-100",
					},
				].map((stat) => (
					<div
						key={stat.label}
						className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-6 text-white shadow-sm`}
					>
						<div className="mb-2 text-3xl">{stat.icon}</div>
						<h3 className="mb-1 font-semibold text-2xl">{stat.count}</h3>
						<p className={`${stat.textColor} text-sm`}>{stat.label}</p>
					</div>
				))}
			</div>

			{/* Open Projects */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-semibold text-xl">Open Projects</h2>
				<div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-gray-300 border-dashed">
					<div className="text-center">
						<p className="mb-2 text-gray-500 text-lg">
							No collaboration projects yet
						</p>
						<p className="text-gray-400 text-sm">
							Start a project or browse opportunities to collaborate
						</p>
						<button
							type="button"
							className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Create Project
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
