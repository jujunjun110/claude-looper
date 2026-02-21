import type { KnowledgeSearchGateway } from '@/backend/contexts/content-check/domain/gateways/knowledge-search.gateway';
import type { PrismaClient } from '@prisma/client';

type RawKnowledgeEmbeddingRow = {
	chunk_text: string;
};

export class PrismaKnowledgeSearchGateway implements KnowledgeSearchGateway {
	constructor(private readonly prisma: PrismaClient) {}

	async searchSimilar(embedding: number[], limit: number): Promise<{ chunkText: string }[]> {
		const vectorLiteral = `[${embedding.join(',')}]`;
		const rows = await this.prisma.$queryRaw<RawKnowledgeEmbeddingRow[]>`
			SELECT chunk_text
			FROM knowledge_embeddings
			ORDER BY embedding <-> ${vectorLiteral}::vector
			LIMIT ${limit}
		`;

		return rows.map((row) => ({ chunkText: row.chunk_text }));
	}
}
