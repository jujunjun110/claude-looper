export interface KnowledgeSearchGateway {
	searchSimilar(embedding: number[], limit: number): Promise<{ chunkText: string }[]>;
}
