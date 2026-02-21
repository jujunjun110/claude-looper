declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type KnowledgeEmbeddingId = string & { readonly [brand]: 'KnowledgeEmbeddingId' };

export function createKnowledgeEmbeddingId(value: string): KnowledgeEmbeddingId {
	if (!value || value.trim().length === 0) {
		throw new Error('KnowledgeEmbeddingId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`KnowledgeEmbeddingId must be a valid UUID: ${value}`);
	}

	return value as KnowledgeEmbeddingId;
}
