const DISCOVER_TABS = [
	"All",
	"Directors",
	"Actors",
	"Writers",
	"Singers",
	"Photographers",
	"Editors",
] as const;

export default function DiscoverPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h1 className="mb-2 font-bold text-3xl text-gray-900">Discover</h1>
				<p className="text-gray-600">
					Explore talented creatives and trending content
				</p>
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-4 overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
				{DISCOVER_TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						className="whitespace-nowrap rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 font-medium text-sm text-white first:opacity-100 hover:from-purple-700 hover:to-indigo-700"
					>
						{tab}
					</button>
				))}
			</div>

			{/* Content Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-lg"
					>
						<div className="h-48 bg-gradient-to-br from-purple-400 to-indigo-400" />
						<div className="p-4">
							<h3 className="mb-1 font-semibold text-gray-900">
								Creative Project {i}
							</h3>
							<p className="text-gray-600 text-sm">By talented creator</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

