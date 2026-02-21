import type {
	AIGateway,
	GenerateOptions,
} from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicAIGateway implements AIGateway {
	private readonly client: Anthropic;

	constructor() {
		this.client = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});
	}

	async generate(prompt: string, options?: GenerateOptions): Promise<string> {
		const response = await this.client.messages.create({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			messages: [{ role: 'user', content: prompt }],
		});

		const textBlock = response.content.find((block) => block.type === 'text');
		if (!textBlock || textBlock.type !== 'text') {
			throw new Error('No text block in response');
		}
		return textBlock.text;
	}

	async generateWithWebSearch(prompt: string, options?: GenerateOptions): Promise<string> {
		const response = await this.client.messages.create({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			// web_search_20250305 is not yet typed in the SDK, cast required
			tools: [
				{
					type: 'web_search_20250305',
					name: 'web_search',
				} as unknown as Anthropic.Messages.ToolUnion,
			],
			messages: [{ role: 'user', content: prompt }],
		});

		const textBlocks = response.content.filter((block) => block.type === 'text');
		const lastTextBlock = textBlocks[textBlocks.length - 1];
		if (!lastTextBlock || lastTextBlock.type !== 'text') {
			throw new Error('No text block in response');
		}
		return lastTextBlock.text;
	}

	async *generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
		const stream = await this.client.messages.stream({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			messages: [{ role: 'user', content: prompt }],
		});

		for await (const event of stream) {
			if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
				yield event.delta.text;
			}
		}
	}
}
