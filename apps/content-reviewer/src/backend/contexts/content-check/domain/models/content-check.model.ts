import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export type CheckStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface ContentCheckProps {
	readonly id: ContentCheckId;
	readonly userId: UserId;
	readonly content: string;
	readonly status: CheckStatus;
	readonly failedReason: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

const MAX_CONTENT_LENGTH = 30000;

export class ContentCheck {
	readonly id: ContentCheckId;
	readonly userId: UserId;
	readonly content: string;
	readonly status: CheckStatus;
	readonly failedReason: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	private constructor(props: ContentCheckProps) {
		this.id = props.id;
		this.userId = props.userId;
		this.content = props.content;
		this.status = props.status;
		this.failedReason = props.failedReason;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(props: {
		id: ContentCheckId;
		userId: UserId;
		content: string;
	}): Result<ContentCheck, string> {
		if (!props.content || props.content.trim().length === 0) {
			return { success: false, error: 'Content cannot be empty' };
		}

		if (props.content.length > MAX_CONTENT_LENGTH) {
			return {
				success: false,
				error: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`,
			};
		}

		const now = new Date();
		return {
			success: true,
			value: new ContentCheck({
				id: props.id,
				userId: props.userId,
				content: props.content,
				status: 'pending',
				failedReason: null,
				createdAt: now,
				updatedAt: now,
			}),
		};
	}

	static reconstruct(props: ContentCheckProps): ContentCheck {
		return new ContentCheck(props);
	}

	startProcessing(): Result<ContentCheck, string> {
		if (this.status !== 'pending') {
			return {
				success: false,
				error: `Cannot start processing from status: ${this.status}`,
			};
		}

		return {
			success: true,
			value: new ContentCheck({
				...this.toProps(),
				status: 'processing',
				updatedAt: new Date(),
			}),
		};
	}

	complete(): Result<ContentCheck, string> {
		if (this.status !== 'processing') {
			return {
				success: false,
				error: `Cannot complete from status: ${this.status}`,
			};
		}

		return {
			success: true,
			value: new ContentCheck({
				...this.toProps(),
				status: 'completed',
				updatedAt: new Date(),
			}),
		};
	}

	fail(reason?: string): Result<ContentCheck, string> {
		if (this.status !== 'pending' && this.status !== 'processing') {
			return {
				success: false,
				error: `Cannot fail from status: ${this.status}`,
			};
		}

		return {
			success: true,
			value: new ContentCheck({
				...this.toProps(),
				status: 'failed',
				failedReason: reason ?? null,
				updatedAt: new Date(),
			}),
		};
	}

	private toProps(): ContentCheckProps {
		return {
			id: this.id,
			userId: this.userId,
			content: this.content,
			status: this.status,
			failedReason: this.failedReason,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
