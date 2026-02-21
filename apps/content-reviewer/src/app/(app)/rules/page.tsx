import { loadExpressionRules } from '@/backend/contexts/expression-rule/presentation/loaders/expression-rule.loader';
import { ExpressionRuleFormDialog } from '@/components/rules/expression-rule-form-dialog';
import { ExpressionRuleTable } from '@/components/rules/expression-rule-table';

export default async function RulesPage() {
	const rules = await loadExpressionRules();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">表現ルール管理</h1>
					<p className="text-muted-foreground text-sm mt-1">
						コンテンツチェックで使用するNG表現と推奨表現を管理します。
					</p>
				</div>
				<ExpressionRuleFormDialog />
			</div>
			<ExpressionRuleTable rules={rules} />
		</div>
	);
}
