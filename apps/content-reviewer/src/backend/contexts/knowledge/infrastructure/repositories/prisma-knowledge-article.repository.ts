import type { KnowledgeArticleRepository } from '@/backend/contexts/knowledge/domain/gateways/knowledge-article.repository';
import {
	KnowledgeArticle,
	type KnowledgeArticleSourceType,
} from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type {
	PrismaClient,
	KnowledgeArticle as PrismaKnowledgeArticle,
	SourceType,
} from '@prisma/client';

export class PrismaKnowledgeArticleRepository implements KnowledgeArticleRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(article: KnowledgeArticle): Promise<void> {
		const data = this.toPrisma(article);

		await this.prisma.knowledgeArticle.upsert({
			where: { id: article.id as string },
			create: data,
			update: {
				title: data.title,
				content: data.content,
				sourceType: data.sourceType,
				sourceUrl: data.sourceUrl,
			},
		});
	}

	async findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null> {
		const record = await this.prisma.knowledgeArticle.findUnique({
			where: { id: id as string },
		});

		if (!record) {
			return null;
		}

		return this.toDomain(record);
	}

	async findAll(): Promise<KnowledgeArticle[]> {
		const records = await this.prisma.knowledgeArticle.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return records.map((record) => this.toDomain(record));
	}

	async delete(id: KnowledgeArticleId): Promise<void> {
		await this.prisma.knowledgeArticle.delete({
			where: { id: id as string },
		});
	}

	private toDomain(record: PrismaKnowledgeArticle): KnowledgeArticle {
		return KnowledgeArticle.reconstruct({
			id: createKnowledgeArticleId(record.id),
			title: record.title,
			content: record.content,
			sourceType: record.sourceType as KnowledgeArticleSourceType,
			sourceUrl: record.sourceUrl,
			createdBy: createUserId(record.createdBy),
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});
	}

	private toPrisma(article: KnowledgeArticle): {
		id: string;
		title: string;
		content: string;
		sourceType: SourceType;
		sourceUrl: string | null;
		createdBy: string;
		createdAt: Date;
		updatedAt: Date;
	} {
		return {
			id: article.id as string,
			title: article.title,
			content: article.content,
			sourceType: article.sourceType as SourceType,
			sourceUrl: article.sourceUrl,
			createdBy: article.createdBy as string,
			createdAt: article.createdAt,
			updatedAt: article.updatedAt,
		};
	}
}
