import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentSegment } from '../models/content-segment.model';

export interface ContentSegmentRepository {
	saveMany(segments: ContentSegment[]): Promise<void>;
	findByContentCheckId(contentCheckId: ContentCheckId): Promise<ContentSegment[]>;
}
