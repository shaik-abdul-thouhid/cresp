"use client";

import {
	AlertCircle,
	Briefcase,
	Calendar,
	FileText,
	Globe,
	Link as LinkIcon,
	Sparkles,
	Tag,
	Users,
	X,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";

// ============================================
// ESSENTIAL PROJECT INFO
// ============================================

interface EssentialInfoProps {
	projectTitle: string;
	setProjectTitle: Dispatch<SetStateAction<string>>;
	projectType: string;
	setProjectType: Dispatch<SetStateAction<string>>;
	userRole: string;
	setUserRole: Dispatch<SetStateAction<string>>;
	projectStatus: string;
	setProjectStatus: Dispatch<
		SetStateAction<"COMPLETED" | "ONGOING" | "CONCEPT">
	>;
}

export function EssentialInfoSection({
	projectTitle,
	setProjectTitle,
	projectType,
	setProjectType,
	userRole,
	setUserRole,
	projectStatus,
	setProjectStatus,
}: EssentialInfoProps) {
	const projectTypes = [
		"Film/Short Film",
		"Music Video",
		"Documentary",
		"Commercial/Ad",
		"Photography Series",
		"Music Album/EP",
		"Graphic Design",
		"Branding",
		"Animation",
		"VFX Project",
		"Writing/Screenplay",
		"Art Installation",
		"Theater Production",
		"Dance Performance",
		"Podcast/Audio",
		"Other",
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<Briefcase className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">
					Essential Information
				</h3>
			</div>

			{/* Work Title */}
			<div>
				<label
					htmlFor="projectTitle"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Work Title <span className="text-red-500">*</span>
				</label>
				<input
					id="projectTitle"
					type="text"
					value={projectTitle}
					onChange={(e) => setProjectTitle(e.target.value)}
					placeholder="e.g., Midnight Symphony, Urban Dreams Series, Eclipse"
					className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					required
				/>
			</div>

			{/* Your Role & Work Type */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="userRole"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Your Role <span className="text-red-500">*</span>
					</label>
					<input
						id="userRole"
						type="text"
						value={userRole}
						onChange={(e) => setUserRole(e.target.value)}
						placeholder="e.g., Director, Lead Cinematographer, Music Producer"
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="projectType"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Work Type
					</label>
					<select
						id="projectType"
						value={projectType}
						onChange={(e) => setProjectType(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					>
						<option value="">Select type...</option>
						{projectTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Status */}
			<div>
				<label
					htmlFor="projectStatus"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Status
				</label>
				<select
					id="projectStatus"
					value={projectStatus}
					onChange={(e) =>
						setProjectStatus(
							e.target.value as "COMPLETED" | "ONGOING" | "CONCEPT",
						)
					}
					className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				>
					<option value="COMPLETED">Completed</option>
					<option value="ONGOING">Work in Progress</option>
					<option value="CONCEPT">Concept/Sketch</option>
				</select>
			</div>
		</div>
	);
}

// ============================================
// TIMELINE SECTION
// ============================================

interface TimelineProps {
	startDate: string;
	setStartDate: (value: string) => void;
	endDate: string;
	setEndDate: (value: string) => void;
	duration: string;
	setDuration: (value: string) => void;
}

export function TimelineSection({
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	duration,
	setDuration,
}: TimelineProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<Calendar className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">Timeline</h3>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label
						htmlFor="startDate"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Start Date
					</label>
					<input
						id="startDate"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>

				<div>
					<label
						htmlFor="endDate"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						End Date
					</label>
					<input
						id="endDate"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>

				<div>
					<label
						htmlFor="duration"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Duration
					</label>
					<input
						id="duration"
						type="text"
						value={duration}
						onChange={(e) => setDuration(e.target.value)}
						placeholder="e.g., 3 months, 6 weeks, 1 year"
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>
			</div>
		</div>
	);
}

// ============================================
// TEAM & COLLABORATION
// ============================================

interface TeamCollaborationProps {
	isTeamProject: boolean;
	setIsTeamProject: (value: boolean) => void;
	teamSize: string;
	setTeamSize: (value: string) => void;
	responsibilities: string[];
	setResponsibilities: (value: string[]) => void;
	keyContributions: string;
	setKeyContributions: (value: string) => void;
}

export function TeamCollaborationSection({
	isTeamProject,
	setIsTeamProject,
	teamSize,
	setTeamSize,
	responsibilities,
	setResponsibilities,
	keyContributions,
	setKeyContributions,
}: TeamCollaborationProps) {
	const [respInput, setRespInput] = useState("");

	const addResponsibility = () => {
		const resp = respInput.trim();
		if (resp && !responsibilities.includes(resp)) {
			setResponsibilities([...responsibilities, resp]);
			setRespInput("");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<Users className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">
					Team & Collaboration
				</h3>
			</div>

			{/* Team Project Toggle */}
			<div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
				<input
					type="checkbox"
					id="isTeamProject"
					checked={isTeamProject}
					onChange={(e) => setIsTeamProject(e.target.checked)}
					className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
				/>
				<label htmlFor="isTeamProject" className="flex-1 cursor-pointer">
					<span className="font-medium text-gray-900 text-sm">
						This was a collaboration
					</span>
					<p className="text-gray-600 text-xs">
						Check if you worked with other creatives
					</p>
				</label>
				{isTeamProject && (
					<input
						type="number"
						value={teamSize}
						onChange={(e) => setTeamSize(e.target.value)}
						placeholder="Team size"
						min="2"
						className="w-20 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
						aria-label="Team size"
					/>
				)}
			</div>

			{/* Responsibilities */}
			<div>
				<label
					htmlFor="responsibilityInput"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Your Responsibilities
				</label>
				<div className="mb-2 flex flex-wrap gap-2">
					{responsibilities.map((resp) => (
						<span
							key={resp}
							className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 text-sm"
						>
							{resp}
							<button
								type="button"
								onClick={() =>
									setResponsibilities(
										responsibilities.filter((r) => r !== resp),
									)
								}
								className="hover:text-indigo-900"
								aria-label={`Remove ${resp}`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="responsibilityInput"
						type="text"
						value={respInput}
						onChange={(e) => setRespInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addResponsibility();
							}
						}}
						placeholder="e.g., Cinematography, Sound Design, Art Direction"
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
					<button
						type="button"
						onClick={addResponsibility}
						className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
					>
						Add
					</button>
				</div>
			</div>

			{/* Key Contributions */}
			<div>
				<label
					htmlFor="keyContributions"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Your Contributions
				</label>
				<textarea
					id="keyContributions"
					value={keyContributions}
					onChange={(e) => setKeyContributions(e.target.value)}
					placeholder="Describe your specific contributions to this work..."
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>
		</div>
	);
}

// ============================================
// TECHNICAL DETAILS
// ============================================

interface TechDetailsProps {
	technologies: string[];
	setTechnologies: (value: string[]) => void;
	tools: string[];
	setTools: (value: string[]) => void;
	skills: string[];
	setSkills: (value: string[]) => void;
}

export function TechnicalDetailsSection({
	technologies,
	setTechnologies,
	tools,
	setTools,
	skills,
	setSkills,
}: TechDetailsProps) {
	const [techInput, setTechInput] = useState("");
	const [toolInput, setToolInput] = useState("");
	const [skillInput, setSkillInput] = useState("");

	const addItem = (
		value: string,
		currentList: string[],
		setter: (value: string[]) => void,
		inputSetter: (value: string) => void,
	) => {
		const item = value.trim();
		if (item && !currentList.includes(item)) {
			setter([...currentList, item]);
			inputSetter("");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<Sparkles className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">
					Production Details
				</h3>
			</div>

			{/* Technologies */}
			<div>
				<label
					htmlFor="techInput"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Software & Platforms Used
				</label>
				<div className="mb-2 flex flex-wrap gap-2">
					{technologies.map((tech) => (
						<span
							key={tech}
							className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-700 text-sm"
						>
							{tech}
							<button
								type="button"
								onClick={() =>
									setTechnologies(technologies.filter((t) => t !== tech))
								}
								className="hover:text-purple-900"
								aria-label={`Remove ${tech}`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="techInput"
						type="text"
						value={techInput}
						onChange={(e) => setTechInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === ",") {
								e.preventDefault();
								addItem(techInput, technologies, setTechnologies, setTechInput);
							}
						}}
						placeholder="e.g., Adobe Premiere, After Effects, Cinema 4D, Logic Pro"
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
					<button
						type="button"
						onClick={() =>
							addItem(techInput, technologies, setTechnologies, setTechInput)
						}
						className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
					>
						Add
					</button>
				</div>
			</div>

			{/* Tools */}
			<div>
				<label
					htmlFor="toolInput"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Equipment & Hardware
				</label>
				<div className="mb-2 flex flex-wrap gap-2">
					{tools.map((tool) => (
						<span
							key={tool}
							className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700 text-sm"
						>
							{tool}
							<button
								type="button"
								onClick={() => setTools(tools.filter((t) => t !== tool))}
								className="hover:text-blue-900"
								aria-label={`Remove ${tool}`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="toolInput"
						type="text"
						value={toolInput}
						onChange={(e) => setToolInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === ",") {
								e.preventDefault();
								addItem(toolInput, tools, setTools, setToolInput);
							}
						}}
						placeholder="e.g., RED Camera, Rode NTG3, Neumann U87, Canon 5D"
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
					<button
						type="button"
						onClick={() => addItem(toolInput, tools, setTools, setToolInput)}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
					>
						Add
					</button>
				</div>
			</div>

			{/* Skills */}
			<div>
				<label
					htmlFor="skillInput"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Skills Demonstrated
				</label>
				<div className="mb-2 flex flex-wrap gap-2">
					{skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700 text-sm"
						>
							{skill}
							<button
								type="button"
								onClick={() => setSkills(skills.filter((s) => s !== skill))}
								className="hover:text-green-900"
								aria-label={`Remove ${skill}`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="skillInput"
						type="text"
						value={skillInput}
						onChange={(e) => setSkillInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === ",") {
								e.preventDefault();
								addItem(skillInput, skills, setSkills, setSkillInput);
							}
						}}
						placeholder="e.g., Color Grading, Storytelling, Audio Mixing"
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
					<button
						type="button"
						onClick={() =>
							addItem(skillInput, skills, setSkills, setSkillInput)
						}
						className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
					>
						Add
					</button>
				</div>
			</div>

			<p className="text-gray-500 text-xs">
				<Tag className="mr-1 inline h-3 w-3" />
				Add production details to help others discover and understand your work
			</p>
		</div>
	);
}

// ============================================
// PROJECT LINKS
// ============================================

interface ProjectLinksProps {
	liveUrl: string;
	setLiveUrl: (value: string) => void;
	repositoryUrl: string;
	setRepositoryUrl: (value: string) => void;
	caseStudyUrl: string;
	setCaseStudyUrl: (value: string) => void;
}

export function ProjectLinksSection({
	liveUrl,
	setLiveUrl,
	repositoryUrl,
	setRepositoryUrl,
	caseStudyUrl,
	setCaseStudyUrl,
}: ProjectLinksProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<LinkIcon className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">
					Links & Resources
				</h3>
			</div>

			<div className="space-y-3">
				<div>
					<label
						htmlFor="liveUrl"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						<Globe className="mr-1 inline h-4 w-4" />
						View Work (Video, Gallery, Streaming, etc.)
					</label>
					<input
						id="liveUrl"
						type="url"
						value={liveUrl}
						onChange={(e) => setLiveUrl(e.target.value)}
						placeholder="https://vimeo.com/your-video or https://open.spotify.com/track/..."
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>

				<div>
					<label
						htmlFor="repositoryUrl"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Portfolio / External Link
					</label>
					<input
						id="repositoryUrl"
						type="url"
						value={repositoryUrl}
						onChange={(e) => setRepositoryUrl(e.target.value)}
						placeholder="https://behance.net/... or https://dribbble.com/..."
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>

				<div>
					<label
						htmlFor="caseStudyUrl"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Behind the Scenes / Making Of
					</label>
					<input
						id="caseStudyUrl"
						type="url"
						value={caseStudyUrl}
						onChange={(e) => setCaseStudyUrl(e.target.value)}
						placeholder="https://youtube.com/watch?v=... (BTS footage)"
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
					/>
				</div>
			</div>

			<p className="text-gray-500 text-xs">
				<AlertCircle className="mr-1 inline h-3 w-3" />
				Links help showcase your work and build credibility
			</p>
		</div>
	);
}

// ============================================
// PROJECT STORY
// ============================================

interface ProjectStoryProps {
	problemStatement: string;
	setProblemStatement: (value: string) => void;
	solution: string;
	setSolution: (value: string) => void;
	impact: string;
	setImpact: (value: string) => void;
	challenges: string;
	setChallenges: (value: string) => void;
	lessonsLearned: string;
	setLessonsLearned: (value: string) => void;
}

export function ProjectStorySection({
	problemStatement,
	setProblemStatement,
	solution,
	setSolution,
	impact,
	setImpact,
	challenges,
	setChallenges,
	lessonsLearned,
	setLessonsLearned,
}: ProjectStoryProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-gray-200 border-b pb-3">
				<FileText className="h-5 w-5 text-purple-600" />
				<h3 className="font-semibold text-gray-900 text-lg">
					Story Behind the Work
				</h3>
			</div>

			<div>
				<label
					htmlFor="problemStatement"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Concept & Inspiration
				</label>
				<textarea
					id="problemStatement"
					value={problemStatement}
					onChange={(e) => setProblemStatement(e.target.value)}
					placeholder="What inspired this work? What story were you trying to tell?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>

			<div>
				<label
					htmlFor="solution"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Creative Process & Execution
				</label>
				<textarea
					id="solution"
					value={solution}
					onChange={(e) => setSolution(e.target.value)}
					placeholder="How did you bring this vision to life? What was your creative approach?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>

			<div>
				<label
					htmlFor="impact"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Reception & Impact
				</label>
				<textarea
					id="impact"
					value={impact}
					onChange={(e) => setImpact(e.target.value)}
					placeholder="How was it received? Awards, audience response, press coverage, client satisfaction?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>

			<div>
				<label
					htmlFor="challenges"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Creative Challenges
				</label>
				<textarea
					id="challenges"
					value={challenges}
					onChange={(e) => setChallenges(e.target.value)}
					placeholder="What creative or technical challenges did you overcome?"
					rows={2}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>

			<div>
				<label
					htmlFor="lessonsLearned"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					Key Learnings
				</label>
				<textarea
					id="lessonsLearned"
					value={lessonsLearned}
					onChange={(e) => setLessonsLearned(e.target.value)}
					placeholder="What did you learn or discover through creating this work?"
					rows={2}
					className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
				/>
			</div>

			<p className="text-gray-500 text-xs">
				<Sparkles className="mr-1 inline h-3 w-3" />A compelling story helps
				others connect with your creative vision
			</p>
		</div>
	);
}
