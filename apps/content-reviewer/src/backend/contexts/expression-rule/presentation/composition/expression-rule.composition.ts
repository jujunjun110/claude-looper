import { CreateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase';
import { DeleteExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/delete-expression-rule.usecase';
import { ListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/application/usecases/list-expression-rules.usecase';
import { UpdateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/update-expression-rule.usecase';
import { PrismaExpressionRuleRepository } from '@/backend/contexts/expression-rule/infrastructure/repositories/prisma-expression-rule.repository';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';

export function createListExpressionRulesUseCase(): ListExpressionRulesUseCase {
	const repository = new PrismaExpressionRuleRepository(prisma);
	return new ListExpressionRulesUseCase(repository);
}

export function createCreateExpressionRuleUseCase(): CreateExpressionRuleUseCase {
	const repository = new PrismaExpressionRuleRepository(prisma);
	return new CreateExpressionRuleUseCase(repository);
}

export function createUpdateExpressionRuleUseCase(): UpdateExpressionRuleUseCase {
	const repository = new PrismaExpressionRuleRepository(prisma);
	return new UpdateExpressionRuleUseCase(repository);
}

export function createDeleteExpressionRuleUseCase(): DeleteExpressionRuleUseCase {
	const repository = new PrismaExpressionRuleRepository(prisma);
	return new DeleteExpressionRuleUseCase(repository);
}
