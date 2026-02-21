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
		throw new Error('not implemented');
	}

	static reconstruct(props: ContentCheckProps): ContentCheck {
		throw new Error('not implemented');
	}

	startProcessing(): Result<ContentCheck, string> {
		throw new Error('not implemented');
	}

	complete(): Result<ContentCheck, string> {
		throw new Error('not implemented');
	}

	fail(reason?: string): Result<ContentCheck, string> {
		throw new Error('not implemented');
	}
}
