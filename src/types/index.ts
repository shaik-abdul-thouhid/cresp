/**
 * TypeScript types for the Cresp platform
 */

/**
 * Creative role types representing different professions on the platform
 */
export type CreativeRole =
	| "director"
	| "actor"
	| "writer"
	| "screenwriter"
	| "singer"
	| "lyricist"
	| "photographer"
	| "video-editor"
	| "composer"
	| "producer"
	| "cinematographer"
	| "dancer"
	| "choreographer"
	| "other";

/**
 * User profile data
 */
export interface UserProfile {
	id: string;
	name: string;
	email: string;
	image?: string;
	bio?: string;
	roles: CreativeRole[];
	location?: string;
	website?: string;
	social?: {
		instagram?: string;
		twitter?: string;
		linkedin?: string;
		youtube?: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Post/Content types
 */
export type PostType = "image" | "video" | "audio" | "text" | "portfolio";

export interface Post {
	id: string;
	userId: string;
	type: PostType;
	title: string;
	description?: string;
	mediaUrls: string[];
	tags: string[];
	category?: CreativeRole;
	likes: number;
	comments: number;
	shares: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Collaboration request types
 */
export type CollaborationStatus = "pending" | "accepted" | "rejected" | "completed";

export interface CollaborationRequest {
	id: string;
	initiatorId: string;
	recipientId: string;
	projectTitle: string;
	description: string;
	requiredRoles: CreativeRole[];
	status: CollaborationStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Project for collaboration
 */
export interface Project {
	id: string;
	title: string;
	description: string;
	ownerId: string;
	collaborators: string[];
	requiredRoles: CreativeRole[];
	status: "open" | "in-progress" | "completed";
	startDate?: Date;
	endDate?: Date;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Notification types
 */
export type NotificationType =
	| "like"
	| "comment"
	| "follow"
	| "collaboration-request"
	| "collaboration-accepted"
	| "mention";

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	actionUrl?: string;
	read: boolean;
	createdAt: Date;
}

/**
 * Message/Chat types
 */
export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	attachments?: string[];
	read: boolean;
	createdAt: Date;
}

export interface Conversation {
	id: string;
	participants: string[];
	lastMessage?: Message;
	unreadCount: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Search filters
 */
export interface SearchFilters {
	query?: string;
	roles?: CreativeRole[];
	location?: string;
	tags?: string[];
}

/**
 * Feed filter options
 */
export type FeedFilter = "following" | "trending" | "recent" | "recommended";

/**
 * Component prop types
 */
export interface NavItem {
	label: string;
	href: string;
	icon?: string;
}

export interface ActionCardProps {
	icon: string;
	title: string;
	description: string;
	color: string;
	onClick?: () => void;
}

