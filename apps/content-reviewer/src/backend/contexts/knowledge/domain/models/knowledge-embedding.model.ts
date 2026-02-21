import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import type { KnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';

export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface KnowledgeEmbeddingProps {
	readonly id: KnowledgeEmbeddingId;
	readonly knowledgeArticleId: KnowledgeArticleId;
	readonly chunkIndex: number;
	readonly chunkText: string;
	readonly embedding: number[];
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export class KnowledgeEmbedding {
	readonly id: KnowledgeEmbeddingId;
	readonly knowledgeArticleId: KnowledgeArticleId;
	readonly chunkIndex: number;
	readonly chunkText: string;
	readonly embedding: number[];
	readonly createdAt: Date;
	readonly updatedAt: Date;

	private constructor(props: KnowledgeEmbeddingProps) {
		this.id = props.id;
		this.knowledgeArticleId = props.knowledgeArticleId;
		this.chunkIndex = props.chunkIndex;
		this.chunkText = props.chunkText;
		this.embedding = props.embedding;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(props: {
		id: KnowledgeEmbeddingId;
		knowledgeArticleId: KnowledgeArticleId;
		chunkIndex: number;
		chunkText: string;
		embedding: number[];
		createdAt?: Date;
		updatedAt?: Date;
	}): Result<KnowledgeEmbedding, string> {
		if (props.chunkIndex < 0) {
			return { success: false, error: 'Chunk index must be non-negative' };
		}

		if (!props.chunkText || props.chunkText.trim().length === 0) {
			return { success: false, error: 'Chunk text cannot be empty' };
		}

		if (!props.embedding || props.embedding.length === 0) {
			return { success: false, error: 'Embedding must not be empty' };
		}

		const now = new Date();
		return {
			success: true,
			value: new KnowledgeEmbedding({
				id: props.id,
				knowledgeArticleId: props.knowledgeArticleId,
				chunkIndex: props.chunkIndex,
				chunkText: props.chunkText,
				embedding: props.embedding,
				createdAt: props.createdAt ?? now,
				updatedAt: props.updatedAt ?? now,
			}),
		};
	}

	static reconstruct(props: KnowledgeEmbeddingProps): KnowledgeEmbedding {
		return new KnowledgeEmbedding(props);
	}
}
