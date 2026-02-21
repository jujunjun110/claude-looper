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

const VALID_CHECK_TYPES: CheckType[] = [
	'fact_check',
	'knowledge_consistency',
	'expression_rule',
	'risk_assessment',
	'quality',
];

const VALID_SEVERITIES: Severity[] = ['info', 'warning', 'error'];

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
		if (!props.message || props.message.trim().length === 0) {
			return { success: false, error: 'Message cannot be empty' };
		}

		if (!VALID_CHECK_TYPES.includes(props.checkType)) {
			return { success: false, error: `Invalid checkType: ${props.checkType}` };
		}

		if (!VALID_SEVERITIES.includes(props.severity)) {
			return { success: false, error: `Invalid severity: ${props.severity}` };
		}

		return {
			success: true,
			value: new CheckResult({
				id: props.id,
				segmentId: props.segmentId,
				contentCheckId: props.contentCheckId,
				checkType: props.checkType,
				severity: props.severity,
				message: props.message,
				suggestion: props.suggestion ?? null,
				createdAt: new Date(),
			}),
		};
	}

	static reconstruct(props: CheckResultProps): CheckResult {
		return new CheckResult(props);
	}
}
