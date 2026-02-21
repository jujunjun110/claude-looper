import { OpenAIEmbeddingGateway } from '@/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway';
import OpenAI from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('openai');

describe('OpenAIEmbeddingGateway', () => {
	const mockEmbedding = Array.from({ length: 1536 }, (_, i) => i / 1536);

	const mockCreate = vi.fn().mockResolvedValue({
		data: [{ embedding: mockEmbedding }],
	});

	beforeEach(() => {
		vi.mocked(OpenAI).mockImplementation(
			() =>
				({
					embeddings: { create: mockCreate },
				}) as unknown as OpenAI,
		);
		vi.clearAllMocks();
		mockCreate.mockResolvedValue({ data: [{ embedding: mockEmbedding }] });
	});

	it('should return a 1536-dimensional embedding vector', async () => {
		const gateway = new OpenAIEmbeddingGateway();
		const result = await gateway.generateEmbedding('テストテキスト');

		expect(result).toHaveLength(1536);
		expect(result).toEqual(mockEmbedding);
	});

	it('should call embeddings.create with correct parameters', async () => {
		const gateway = new OpenAIEmbeddingGateway();
		await gateway.generateEmbedding('テストテキスト');

		expect(mockCreate).toHaveBeenCalledOnce();
		expect(mockCreate).toHaveBeenCalledWith({
			model: 'text-embedding-3-small',
			input: 'テストテキスト',
			dimensions: 1536,
		});
	});

	it('should propagate API errors', async () => {
		mockCreate.mockRejectedValue(new Error('API error'));
		const gateway = new OpenAIEmbeddingGateway();

		await expect(gateway.generateEmbedding('テスト')).rejects.toThrow('API error');
	});

	it('should pass different text inputs correctly', async () => {
		const gateway = new OpenAIEmbeddingGateway();
		const text = '別のテキスト入力';
		await gateway.generateEmbedding(text);

		expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ input: text }));
	});
});
