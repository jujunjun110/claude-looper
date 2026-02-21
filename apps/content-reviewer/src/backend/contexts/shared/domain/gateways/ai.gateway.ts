export interface GenerateOptions {
	maxTokens?: number;
	temperature?: number;
}

export interface AIGateway {
	generate(prompt: string, options?: GenerateOptions): Promise<string>;
	generateWithWebSearch(prompt: string, options?: GenerateOptions): Promise<string>;
	generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string>;
}
