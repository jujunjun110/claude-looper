import { CreateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/create-knowledge-article.usecase';
import { DeleteKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/delete-knowledge-article.usecase';
import { ListKnowledgeArticlesUseCase } from '@/backend/contexts/knowledge/application/usecases/list-knowledge-articles.usecase';
import { UpdateKnowledgeArticleUseCase } from '@/backend/contexts/knowledge/application/usecases/update-knowledge-article.usecase';
import { PrismaKnowledgeArticleRepository } from '@/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-article.repository';
import { PrismaKnowledgeEmbeddingRepository } from '@/backend/contexts/knowledge/infrastructure/repositories/prisma-knowledge-embedding.repository';
import { OpenAIEmbeddingGateway } from '@/backend/contexts/shared/infrastructure/ai/openai-embedding.gateway';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';

function createArticleRepository(): PrismaKnowledgeArticleRepository {
	return new PrismaKnowledgeArticleRepository(prisma);
}

function createEmbeddingRepository(): PrismaKnowledgeEmbeddingRepository {
	return new PrismaKnowledgeEmbeddingRepository(prisma);
}

function createEmbeddingGateway(): OpenAIEmbeddingGateway {
	return new OpenAIEmbeddingGateway();
}

export function createListKnowledgeArticlesUseCase(): ListKnowledgeArticlesUseCase {
	return new ListKnowledgeArticlesUseCase(createArticleRepository());
}

export function createCreateKnowledgeArticleUseCase(): CreateKnowledgeArticleUseCase {
	return new CreateKnowledgeArticleUseCase(
		createArticleRepository(),
		createEmbeddingRepository(),
		createEmbeddingGateway(),
	);
}

export function createUpdateKnowledgeArticleUseCase(): UpdateKnowledgeArticleUseCase {
	return new UpdateKnowledgeArticleUseCase(
		createArticleRepository(),
		createEmbeddingRepository(),
		createEmbeddingGateway(),
	);
}

export function createDeleteKnowledgeArticleUseCase(): DeleteKnowledgeArticleUseCase {
	return new DeleteKnowledgeArticleUseCase(createArticleRepository(), createEmbeddingRepository());
}
