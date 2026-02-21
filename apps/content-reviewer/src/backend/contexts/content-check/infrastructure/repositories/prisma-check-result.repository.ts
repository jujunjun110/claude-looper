import type { CheckResultRepository } from '@/backend/contexts/content-check/domain/gateways/check-result.repository';
import {
	CheckResult,
	type CheckType,
	type Severity,
} from '@/backend/contexts/content-check/domain/models/check-result.model';
import { createCheckResultId } from '@/backend/contexts/shared/domain/models/check-result-id.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type { ContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type {
	CheckResult as PrismaCheckResult,
	CheckType as PrismaCheckType,
	PrismaClient,
	Severity as PrismaSeverity,
} from '@prisma/client';

type PrismaCheckResultWithSegment = PrismaCheckResult & {
	contentSegment: { contentCheckId: string };
};

export class PrismaCheckResultRepository implements CheckResultRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async saveMany(results: CheckResult[]): Promise<void> {
		if (results.length === 0) return;

		await this.prisma.checkResult.createMany({
			data: results.map((r) => this.toPrisma(r)),
			skipDuplicates: true,
		});
	}

	async findBySegmentId(segmentId: ContentSegmentId): Promise<CheckResult[]> {
		const records = await this.prisma.checkResult.findMany({
			where: { contentSegmentId: segmentId as string },
			include: { contentSegment: { select: { contentCheckId: true } } },
		});

		return records.map((record) => this.toDomain(record));
	}

	async findByContentCheckId(contentCheckId: ContentCheckId): Promise<CheckResult[]> {
		const records = await this.prisma.checkResult.findMany({
			where: { contentSegment: { contentCheckId: contentCheckId as string } },
			include: { contentSegment: { select: { contentCheckId: true } } },
		});

		return records.map((record) => this.toDomain(record));
	}

	private toDomain(record: PrismaCheckResultWithSegment): CheckResult {
		return CheckResult.reconstruct({
			id: createCheckResultId(record.id),
			segmentId: createContentSegmentId(record.contentSegmentId),
			contentCheckId: createContentCheckId(record.contentSegment.contentCheckId),
			checkType: record.checkType as CheckType,
			severity: record.severity as Severity,
			message: record.message,
			suggestion: record.suggestion,
			createdAt: record.createdAt,
		});
	}

	private toPrisma(result: CheckResult): {
		id: string;
		contentSegmentId: string;
		checkType: PrismaCheckType;
		severity: PrismaSeverity;
		message: string;
		suggestion: string | null;
		createdAt: Date;
	} {
		return {
			id: result.id as string,
			contentSegmentId: result.segmentId as string,
			checkType: result.checkType as PrismaCheckType,
			severity: result.severity as PrismaSeverity,
			message: result.message,
			suggestion: result.suggestion,
			createdAt: result.createdAt,
		};
	}
}
