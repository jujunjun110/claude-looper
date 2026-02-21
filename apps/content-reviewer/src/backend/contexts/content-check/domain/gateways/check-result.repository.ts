import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type { CheckResult } from '../models/check-result.model';

export interface CheckResultRepository {
	saveMany(results: CheckResult[]): Promise<void>;
	findBySegmentId(segmentId: ContentSegmentId): Promise<CheckResult[]>;
	findByContentCheckId(contentCheckId: ContentCheckId): Promise<CheckResult[]>;
}
