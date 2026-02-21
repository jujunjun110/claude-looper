import { AnthropicAIGateway } from '@/backend/contexts/shared/infrastructure/ai/anthropic-ai.gateway';
import Anthropic from '@anthropic-ai/sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@anthropic-ai/sdk');

describe('AnthropicAIGateway', () => {
	const mockCreate = vi.fn();
	const mockStream = vi.fn();

	beforeEach(() => {
		vi.mocked(Anthropic).mockImplementation(
			() =>
				({
					messages: {
						create: mockCreate,
						stream: mockStream,
					},
				}) as unknown as Anthropic,
		);
		vi.clearAllMocks();
	});

	describe('generate', () => {
		it('should return the first text block from the response', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'text', text: 'Hello, world!' }],
			});

			const gateway = new AnthropicAIGateway();
			const result = await gateway.generate('Say hello');

			expect(result).toBe('Hello, world!');
		});

		it('should call messages.create with correct parameters', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'text', text: 'response' }],
			});

			const gateway = new AnthropicAIGateway();
			await gateway.generate('test prompt');

			expect(mockCreate).toHaveBeenCalledOnce();
			expect(mockCreate).toHaveBeenCalledWith({
				model: 'claude-sonnet-4-6',
				max_tokens: 4096,
				messages: [{ role: 'user', content: 'test prompt' }],
			});
		});

		it('should pass maxTokens and temperature options when provided', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'text', text: 'response' }],
			});

			const gateway = new AnthropicAIGateway();
			await gateway.generate('test prompt', { maxTokens: 1000, temperature: 0.5 });

			expect(mockCreate).toHaveBeenCalledWith({
				model: 'claude-sonnet-4-6',
				max_tokens: 1000,
				temperature: 0.5,
				messages: [{ role: 'user', content: 'test prompt' }],
			});
		});

		it('should return the first text block when multiple blocks are present', async () => {
			mockCreate.mockResolvedValue({
				content: [
					{ type: 'text', text: 'first text' },
					{ type: 'text', text: 'second text' },
				],
			});

			const gateway = new AnthropicAIGateway();
			const result = await gateway.generate('prompt');

			expect(result).toBe('first text');
		});

		it('should throw when no text block is present', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'tool_use', id: 'id', name: 'tool', input: {} }],
			});

			const gateway = new AnthropicAIGateway();

			await expect(gateway.generate('prompt')).rejects.toThrow('No text block in response');
		});
	});

	describe('generateWithWebSearch', () => {
		it('should return the last text block from the response', async () => {
			mockCreate.mockResolvedValue({
				content: [
					{ type: 'text', text: 'initial text' },
					{ type: 'tool_use', id: 'id', name: 'web_search', input: { query: 'test' } },
					{ type: 'text', text: 'final answer with search results' },
				],
			});

			const gateway = new AnthropicAIGateway();
			const result = await gateway.generateWithWebSearch('Search for something');

			expect(result).toBe('final answer with search results');
		});

		it('should call messages.create with web_search_20250305 tool', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'text', text: 'response' }],
			});

			const gateway = new AnthropicAIGateway();
			await gateway.generateWithWebSearch('test prompt');

			expect(mockCreate).toHaveBeenCalledOnce();
			expect(mockCreate).toHaveBeenCalledWith({
				model: 'claude-sonnet-4-6',
				max_tokens: 4096,
				tools: [{ type: 'web_search_20250305', name: 'web_search' }],
				messages: [{ role: 'user', content: 'test prompt' }],
			});
		});

		it('should pass maxTokens option when provided', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'text', text: 'response' }],
			});

			const gateway = new AnthropicAIGateway();
			await gateway.generateWithWebSearch('test prompt', { maxTokens: 2000 });

			expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ max_tokens: 2000 }));
		});

		it('should throw when no text block is present', async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: 'tool_use', id: 'id', name: 'web_search', input: {} }],
			});

			const gateway = new AnthropicAIGateway();

			await expect(gateway.generateWithWebSearch('prompt')).rejects.toThrow(
				'No text block in response',
			);
		});
	});
});
