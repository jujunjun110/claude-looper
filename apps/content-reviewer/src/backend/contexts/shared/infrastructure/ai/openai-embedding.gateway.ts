import type { EmbeddingGateway } from '@/backend/contexts/shared/domain/gateways/embedding.gateway';
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export class OpenAIEmbeddingGateway implements EmbeddingGateway {
	private readonly client: OpenAI;

	constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}

	async generateEmbedding(text: string): Promise<number[]> {
		const response = await this.client.embeddings.create({
			model: EMBEDDING_MODEL,
			input: text,
			dimensions: EMBEDDING_DIMENSIONS,
		});

		return response.data[0].embedding;
	}
}
