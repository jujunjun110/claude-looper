import { createKnowledgeEmbeddingId } from '@/backend/contexts/shared/domain/models/knowledge-embedding-id.model';
import { describe, expect, it } from 'vitest';

describe('KnowledgeEmbeddingId', () => {
	it('should create a KnowledgeEmbeddingId from a valid UUID', () => {
		const id = createKnowledgeEmbeddingId('550e8400-e29b-41d4-a716-446655440000');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('should create a KnowledgeEmbeddingId from a UUID with uppercase letters', () => {
		const id = createKnowledgeEmbeddingId('550E8400-E29B-41D4-A716-446655440000');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440000');
	});

	it('should throw on empty string', () => {
		expect(() => createKnowledgeEmbeddingId('')).toThrow('KnowledgeEmbeddingId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createKnowledgeEmbeddingId('   ')).toThrow('KnowledgeEmbeddingId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createKnowledgeEmbeddingId('not-a-uuid')).toThrow(
			'KnowledgeEmbeddingId must be a valid UUID: not-a-uuid',
		);
	});

	it('should throw on UUID with wrong format', () => {
		expect(() => createKnowledgeEmbeddingId('550e8400-e29b-41d4-a716')).toThrow(
			'KnowledgeEmbeddingId must be a valid UUID',
		);
	});
});
