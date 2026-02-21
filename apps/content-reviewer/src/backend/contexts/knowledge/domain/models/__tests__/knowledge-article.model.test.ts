import { KnowledgeArticle } from '@/backend/contexts/knowledge/domain/models/knowledge-article.model';
import { createKnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { describe, expect, it } from 'vitest';

const validId = createKnowledgeArticleId('550e8400-e29b-41d4-a716-446655440000');
const validUserId = createUserId('user-1');

describe('KnowledgeArticle', () => {
	describe('create', () => {
		it('should create a KnowledgeArticle with valid props', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: 'テスト記事',
				content: 'テスト本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBe(validId);
				expect(result.value.title).toBe('テスト記事');
				expect(result.value.content).toBe('テスト本文');
				expect(result.value.sourceType).toBe('manual');
				expect(result.value.sourceUrl).toBeNull();
				expect(result.value.createdBy).toBe(validUserId);
			}
		});

		it('should create a KnowledgeArticle with sourceUrl', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: 'note記事',
				content: 'note本文',
				sourceType: 'note',
				sourceUrl: 'https://note.com/example/n/abc123',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.sourceUrl).toBe('https://note.com/example/n/abc123');
			}
		});

		it('should trim the title', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: '  タイトル  ',
				content: '本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.title).toBe('タイトル');
			}
		});

		it('should fail when title is empty', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: '',
				content: '本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Title cannot be empty');
			}
		});

		it('should fail when title is whitespace only', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: '   ',
				content: '本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Title cannot be empty');
			}
		});

		it('should fail when content is empty', () => {
			const result = KnowledgeArticle.create({
				id: validId,
				title: 'タイトル',
				content: '',
				sourceType: 'manual',
				createdBy: validUserId,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Content cannot be empty');
			}
		});
	});

	describe('reconstruct', () => {
		it('should reconstruct a KnowledgeArticle from props', () => {
			const now = new Date();
			const article = KnowledgeArticle.reconstruct({
				id: validId,
				title: 'タイトル',
				content: '本文',
				sourceType: 'manual',
				sourceUrl: null,
				createdBy: validUserId,
				createdAt: now,
				updatedAt: now,
			});

			expect(article.id).toBe(validId);
			expect(article.title).toBe('タイトル');
		});
	});

	describe('update', () => {
		it('should update title and content', () => {
			const createResult = KnowledgeArticle.create({
				id: validId,
				title: '元のタイトル',
				content: '元の本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const updateResult = createResult.value.update({
				title: '新しいタイトル',
				content: '新しい本文',
			});

			expect(updateResult.success).toBe(true);
			if (updateResult.success) {
				expect(updateResult.value.title).toBe('新しいタイトル');
				expect(updateResult.value.content).toBe('新しい本文');
				expect(updateResult.value.sourceType).toBe('manual');
			}
		});

		it('should fail when updating with empty title', () => {
			const createResult = KnowledgeArticle.create({
				id: validId,
				title: 'タイトル',
				content: '本文',
				sourceType: 'manual',
				createdBy: validUserId,
			});
			expect(createResult.success).toBe(true);
			if (!createResult.success) return;

			const updateResult = createResult.value.update({ title: '', content: '本文' });

			expect(updateResult.success).toBe(false);
			if (!updateResult.success) {
				expect(updateResult.error).toBe('Title cannot be empty');
			}
		});
	});
});
