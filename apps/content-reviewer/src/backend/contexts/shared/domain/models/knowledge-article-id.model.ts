declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type KnowledgeArticleId = string & { readonly [brand]: 'KnowledgeArticleId' };

export function createKnowledgeArticleId(value: string): KnowledgeArticleId {
	if (!value || value.trim().length === 0) {
		throw new Error('KnowledgeArticleId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`KnowledgeArticleId must be a valid UUID: ${value}`);
	}

	return value as KnowledgeArticleId;
}
