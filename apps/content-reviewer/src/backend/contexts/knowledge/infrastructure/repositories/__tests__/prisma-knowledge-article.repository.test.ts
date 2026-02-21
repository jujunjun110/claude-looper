import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { PrismaKnowledgeArticleRepository } from '@/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-article.repository';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { PrismaClient, KnowledgeArticle as PrismaKnowledgeArticle } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

const ARTICLE_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = 'aabbccdd-e29b-41d4-a716-446655440000';

function makePrismaRecord(overrides: Partial<PrismaKnowledgeArticle> = {}): PrismaKnowledgeArticle {
	return {
		id: ARTICLE_ID,
		title: 'テストタイトル',
		content: 'テスト本文',
		sourceType: 'manual' as never,
		sourceUrl: null,
		createdBy: USER_ID,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-02'),
		...overrides,
	};
}

function makeMockPrisma(overrides: Record<string, unknown> = {}) {
	return {
		knowledgeArticle: {
			upsert: vi.fn().mockResolvedValue(undefined),
			findUnique: vi.fn().mockResolvedValue(null),
			findMany: vi.fn().mockResolvedValue([]),
			delete: vi.fn().mockResolvedValue(undefined),
			...overrides,
		},
	} as unknown as PrismaClient;
}

function makeDomainArticle(): KnowledgeArticle {
	const result = KnowledgeArticle.create({
		id: createKnowledgeArticleId(ARTICLE_ID),
		title: 'テストタイトル',
		content: 'テスト本文',
		sourceType: 'manual',
		createdBy: createUserId(USER_ID),
	});
	if (!result.success) throw new Error('Failed to create article');
	return result.value;
}

describe('PrismaKnowledgeArticleRepository', () => {
	describe('save', () => {
		it('should upsert the article', async () => {
			const prisma = makeMockPrisma();
			const repo = new PrismaKnowledgeArticleRepository(prisma);
			const article = makeDomainArticle();

			await repo.save(article);

			expect(prisma.knowledgeArticle.upsert).toHaveBeenCalledOnce();
			const call = vi.mocked(prisma.knowledgeArticle.upsert).mock.calls[0][0];
			expect(call.where).toEqual({ id: ARTICLE_ID });
			expect(call.create.id).toBe(ARTICLE_ID);
			expect(call.create.title).toBe('テストタイトル');
			expect(call.update.title).toBe('テストタイトル');
		});
	});

	describe('findById', () => {
		it('should return null when article not found', async () => {
			const prisma = makeMockPrisma({ findUnique: vi.fn().mockResolvedValue(null) });
			const repo = new PrismaKnowledgeArticleRepository(prisma);

			const result = await repo.findById(createKnowledgeArticleId(ARTICLE_ID));

			expect(result).toBeNull();
		});

		it('should return a domain article when found', async () => {
			const record = makePrismaRecord();
			const prisma = makeMockPrisma({ findUnique: vi.fn().mockResolvedValue(record) });
			const repo = new PrismaKnowledgeArticleRepository(prisma);

			const result = await repo.findById(createKnowledgeArticleId(ARTICLE_ID));

			expect(result).not.toBeNull();
			expect(result?.id).toBe(ARTICLE_ID);
			expect(result?.title).toBe('テストタイトル');
			expect(result?.sourceType).toBe('manual');
		});
	});

	describe('findAll', () => {
		it('should return empty array when no articles', async () => {
			const prisma = makeMockPrisma({ findMany: vi.fn().mockResolvedValue([]) });
			const repo = new PrismaKnowledgeArticleRepository(prisma);

			const result = await repo.findAll();

			expect(result).toEqual([]);
		});

		it('should return mapped domain articles', async () => {
			const records = [
				makePrismaRecord({ id: ARTICLE_ID, title: '記事1' }),
				makePrismaRecord({ id: 'bbbbbbbb-e29b-41d4-a716-446655440000', title: '記事2' }),
			];
			const prisma = makeMockPrisma({ findMany: vi.fn().mockResolvedValue(records) });
			const repo = new PrismaKnowledgeArticleRepository(prisma);

			const result = await repo.findAll();

			expect(result).toHaveLength(2);
			expect(result[0].title).toBe('記事1');
			expect(result[1].title).toBe('記事2');
		});
	});

	describe('delete', () => {
		it('should call prisma delete with the given id', async () => {
			const prisma = makeMockPrisma();
			const repo = new PrismaKnowledgeArticleRepository(prisma);

			await repo.delete(createKnowledgeArticleId(ARTICLE_ID));

			expect(prisma.knowledgeArticle.delete).toHaveBeenCalledOnce();
			expect(prisma.knowledgeArticle.delete).toHaveBeenCalledWith({ where: { id: ARTICLE_ID } });
		});
	});
});
