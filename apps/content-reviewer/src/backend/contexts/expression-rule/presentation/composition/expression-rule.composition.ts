import { CreateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/create-expression-rule.usecase';
import { DeleteExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/delete-expression-rule.usecase';
import { ListExpressionRulesUseCase } from '@/backend/contexts/expression-rule/application/usecases/list-expression-rules.usecase';
import { UpdateExpressionRuleUseCase } from '@/backend/contexts/expression-rule/application/usecases/update-expression-rule.usecase';
import { PrismaExpressionRuleRepository } from '@/backend/contexts/expression-rule/infrastructure/repositories/prisma-expression-rule.repository';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';

function createRepository(): PrismaExpressionRuleRepository {
	return new PrismaExpressionRuleRepository(prisma);
}

export function createListExpressionRulesUseCase(): ListExpressionRulesUseCase {
	return new ListExpressionRulesUseCase(createRepository());
}

export function createCreateExpressionRuleUseCase(): CreateExpressionRuleUseCase {
	return new CreateExpressionRuleUseCase(createRepository());
}

export function createUpdateExpressionRuleUseCase(): UpdateExpressionRuleUseCase {
	return new UpdateExpressionRuleUseCase(createRepository());
}

export function createDeleteExpressionRuleUseCase(): DeleteExpressionRuleUseCase {
	return new DeleteExpressionRuleUseCase(createRepository());
}
