import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { CheckStatus, ContentCheck } from '../models/content-check.model';

export interface ContentCheckFilter {
	userId?: UserId;
	status?: CheckStatus;
}

export interface ContentCheckRepository {
	save(contentCheck: ContentCheck): Promise<void>;
	findById(id: ContentCheckId): Promise<ContentCheck | null>;
	findAll(filter?: ContentCheckFilter): Promise<ContentCheck[]>;
}
