import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';

export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface ContentSegmentProps {
	readonly id: ContentSegmentId;
	readonly contentCheckId: ContentCheckId;
	readonly text: string;
	readonly segmentIndex: number;
	readonly createdAt: Date;
}

export class ContentSegment {
	readonly id: ContentSegmentId;
	readonly contentCheckId: ContentCheckId;
	readonly text: string;
	readonly segmentIndex: number;
	readonly createdAt: Date;

	private constructor(props: ContentSegmentProps) {
		this.id = props.id;
		this.contentCheckId = props.contentCheckId;
		this.text = props.text;
		this.segmentIndex = props.segmentIndex;
		this.createdAt = props.createdAt;
	}

	static create(props: {
		id: ContentSegmentId;
		contentCheckId: ContentCheckId;
		text: string;
		segmentIndex: number;
	}): Result<ContentSegment, string> {
		throw new Error('not implemented');
	}

	static reconstruct(props: ContentSegmentProps): ContentSegment {
		throw new Error('not implemented');
	}
}
