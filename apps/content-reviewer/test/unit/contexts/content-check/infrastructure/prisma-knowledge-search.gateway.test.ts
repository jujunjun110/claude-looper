import { PrismaKnowledgeSearchGateway } from '@/backend/contexts/content-check/infrastructure/prisma-knowledge-search.gateway';
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

function createMockPrisma(queryRawResult: { chunk_text: string }[]): PrismaClient {
	return {
		$queryRaw: vi.fn().mockResolvedValue(queryRawResult),
	} as unknown as PrismaClient;
}

describe('PrismaKnowledgeSearchGateway', () => {
	describe('searchSimilar', () => {
		it('should call prisma.$queryRaw and map results to { chunkText }', async () => {
			const prisma = createMockPrisma([{ chunk_text: 'チャンク1' }, { chunk_text: 'チャンク2' }]);
			const gateway = new PrismaKnowledgeSearchGateway(prisma);
			const embedding = [0.1, 0.2, 0.3];

			const result = await gateway.searchSimilar(embedding, 5);

			expect(prisma.$queryRaw).toHaveBeenCalledOnce();
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({ chunkText: 'チャンク1' });
			expect(result[1]).toEqual({ chunkText: 'チャンク2' });
		});

		it('should return empty array when no results', async () => {
			const prisma = createMockPrisma([]);
			const gateway = new PrismaKnowledgeSearchGateway(prisma);

			const result = await gateway.searchSimilar([0.1, 0.2], 10);

			expect(result).toEqual([]);
		});

		it('should map chunk_text snake_case to chunkText camelCase', async () => {
			const prisma = createMockPrisma([{ chunk_text: 'テキスト内容' }]);
			const gateway = new PrismaKnowledgeSearchGateway(prisma);

			const result = await gateway.searchSimilar([0.5], 1);

			expect(result[0].chunkText).toBe('テキスト内容');
		});
	});
});
