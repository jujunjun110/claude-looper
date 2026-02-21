import type {
	ContentCheckFilter,
	ContentCheckRepository,
} from '@/backend/contexts/content-check/domain/gateways/content-check.repository';
import {
	type CheckStatus,
	ContentCheck,
} from '@/backend/contexts/content-check/domain/models/content-check.model';
import { createContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import type { ContentCheckId } from '@/backend/contexts/shared/domain/models/content-check-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { PrismaClient, ContentCheck as PrismaContentCheck, Status } from '@prisma/client';

export class PrismaContentCheckRepository implements ContentCheckRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(contentCheck: ContentCheck): Promise<void> {
		const data = this.toPrisma(contentCheck);

		await this.prisma.contentCheck.upsert({
			where: { id: contentCheck.id as string },
			create: data,
			update: {
				status: data.status,
				updatedAt: data.updatedAt,
			},
		});
	}

	async findById(id: ContentCheckId): Promise<ContentCheck | null> {
		const record = await this.prisma.contentCheck.findUnique({
			where: { id: id as string },
		});

		if (!record) {
			return null;
		}

		return this.toDomain(record);
	}

	async findAll(filter?: ContentCheckFilter): Promise<ContentCheck[]> {
		const where = {
			...(filter?.userId ? { userId: filter.userId as string } : {}),
			...(filter?.status ? { status: filter.status as Status } : {}),
		};

		const records = await this.prisma.contentCheck.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		});

		return records.map((record) => this.toDomain(record));
	}

	private toDomain(record: PrismaContentCheck): ContentCheck {
		if (!record.userId) {
			throw new Error(`ContentCheck ${record.id} has no userId`);
		}

		return ContentCheck.reconstruct({
			id: createContentCheckId(record.id),
			userId: createUserId(record.userId),
			content: record.originalText,
			status: record.status as CheckStatus,
			failedReason: null,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});
	}

	private toPrisma(contentCheck: ContentCheck): {
		id: string;
		userId: string;
		source: 'web';
		originalText: string;
		status: Status;
		slackChannelId: string | null;
		slackThreadTs: string | null;
		createdAt: Date;
		updatedAt: Date;
	} {
		return {
			id: contentCheck.id as string,
			userId: contentCheck.userId as string,
			source: 'web',
			originalText: contentCheck.content,
			status: contentCheck.status as Status,
			slackChannelId: null,
			slackThreadTs: null,
			createdAt: contentCheck.createdAt,
			updatedAt: contentCheck.updatedAt,
		};
	}
}
