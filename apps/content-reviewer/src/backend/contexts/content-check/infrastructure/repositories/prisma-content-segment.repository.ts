import type { ContentSegmentRepository } from '@/backend/contexts/content-check/domain/gateways/content-segment.repository';
import { ContentSegment } from '@/backend/contexts/content-check/domain/models/content-segment.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createContentSegmentId } from '@/backend/contexts/shared/domain/models/content-segment-id.model';
import type { PrismaClient, ContentSegment as PrismaContentSegment } from '@prisma/client';

export class PrismaContentSegmentRepository implements ContentSegmentRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async saveMany(segments: ContentSegment[]): Promise<void> {
		if (segments.length === 0) return;

		await this.prisma.contentSegment.createMany({
			data: segments.map((s) => this.toPrisma(s)),
			skipDuplicates: true,
		});
	}

	async findByContentCheckId(contentCheckId: ContentCheckId): Promise<ContentSegment[]> {
		const records = await this.prisma.contentSegment.findMany({
			where: { contentCheckId: contentCheckId as string },
			orderBy: { segmentIndex: 'asc' },
		});

		return records.map((record) => this.toDomain(record));
	}

	private toDomain(record: PrismaContentSegment): ContentSegment {
		return ContentSegment.reconstruct({
			id: createContentSegmentId(record.id),
			contentCheckId: createContentCheckId(record.contentCheckId),
			text: record.text,
			segmentIndex: record.segmentIndex,
			createdAt: record.createdAt,
		});
	}

	private toPrisma(segment: ContentSegment): {
		id: string;
		contentCheckId: string;
		segmentIndex: number;
		text: string;
		createdAt: Date;
	} {
		return {
			id: segment.id as string,
			contentCheckId: segment.contentCheckId as string,
			segmentIndex: segment.segmentIndex,
			text: segment.text,
			createdAt: segment.createdAt,
		};
	}
}
