export interface EmbeddingGateway {
	generateEmbedding(text: string): Promise<number[]>;
}
