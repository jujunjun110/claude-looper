import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { describe, expect, it } from 'vitest';

describe('KnowledgeArticleId', () => {
	it('should create a KnowledgeArticleId from a valid UUID', () => {
		const id = createKnowledgeArticleId('550e8400-e29b-41d4-a716-446655440000');
		expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('should create a KnowledgeArticleId from a UUID with uppercase letters', () => {
		const id = createKnowledgeArticleId('550E8400-E29B-41D4-A716-446655440000');
		expect(id).toBe('550E8400-E29B-41D4-A716-446655440000');
	});

	it('should throw on empty string', () => {
		expect(() => createKnowledgeArticleId('')).toThrow('KnowledgeArticleId cannot be empty');
	});

	it('should throw on whitespace-only string', () => {
		expect(() => createKnowledgeArticleId('   ')).toThrow('KnowledgeArticleId cannot be empty');
	});

	it('should throw on non-UUID string', () => {
		expect(() => createKnowledgeArticleId('not-a-uuid')).toThrow(
			'KnowledgeArticleId must be a valid UUID: not-a-uuid',
		);
	});

	it('should throw on UUID with wrong format', () => {
		expect(() => createKnowledgeArticleId('550e8400-e29b-41d4-a716')).toThrow(
			'KnowledgeArticleId must be a valid UUID',
		);
	});
});
