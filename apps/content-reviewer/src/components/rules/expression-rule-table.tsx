'use client';

import type { ExpressionRule } from '@/backend/contexts/expression-rule/domain/models/expression-rule.model';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { DeleteExpressionRuleButton } from './delete-expression-rule-button';
import { ExpressionRuleFormDialog } from './expression-rule-form-dialog';

interface ExpressionRuleTableProps {
	rules: ExpressionRule[];
}

export function ExpressionRuleTable({ rules }: ExpressionRuleTableProps) {
	if (rules.length === 0) {
		return (
			<p className="text-muted-foreground text-sm py-8 text-center">
				表現ルールが登録されていません。
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>NG表現</TableHead>
					<TableHead>推奨表現</TableHead>
					<TableHead>補足説明</TableHead>
					<TableHead>ステータス</TableHead>
					<TableHead className="text-right">操作</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rules.map((rule) => (
					<TableRow key={rule.id as string}>
						<TableCell className="font-medium">{rule.ngExpression}</TableCell>
						<TableCell>{rule.recommendedExpression}</TableCell>
						<TableCell className="text-muted-foreground">{rule.description ?? '—'}</TableCell>
						<TableCell>
							{rule.isActive ? (
								<Badge variant="default">有効</Badge>
							) : (
								<Badge variant="secondary">無効</Badge>
							)}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex items-center justify-end gap-2">
								<ExpressionRuleFormDialog rule={rule} />
								<DeleteExpressionRuleButton
									ruleId={rule.id as string}
									ngExpression={rule.ngExpression}
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
