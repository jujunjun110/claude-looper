import type { CheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';

export type CheckType =
	| 'fact_check'
	| 'knowledge_consistency'
	| 'expression_rule'
	| 'risk_assessment'
	| 'quality';

export type Severity = 'info' | 'warning' | 'error';

export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface CheckResultProps {
	readonly id: CheckResultId;
	readonly segmentId: ContentSegmentId;
	readonly contentCheckId: ContentCheckId;
	readonly checkType: CheckType;
	readonly severity: Severity;
	readonly message: string;
	readonly suggestion: string | null;
	readonly createdAt: Date;
}

export class CheckResult {
	readonly id: CheckResultId;
	readonly segmentId: ContentSegmentId;
	readonly contentCheckId: ContentCheckId;
	readonly checkType: CheckType;
	readonly severity: Severity;
	readonly message: string;
	readonly suggestion: string | null;
	readonly createdAt: Date;

	private constructor(props: CheckResultProps) {
		this.id = props.id;
		this.segmentId = props.segmentId;
		this.contentCheckId = props.contentCheckId;
		this.checkType = props.checkType;
		this.severity = props.severity;
		this.message = props.message;
		this.suggestion = props.suggestion;
		this.createdAt = props.createdAt;
	}

	static create(props: {
		id: CheckResultId;
		segmentId: ContentSegmentId;
		contentCheckId: ContentCheckId;
		checkType: CheckType;
		severity: Severity;
		message: string;
		suggestion?: string | null;
	}): Result<CheckResult, string> {
		throw new Error('not implemented');
	}

	static reconstruct(props: CheckResultProps): CheckResult {
		throw new Error('not implemented');
	}
}
