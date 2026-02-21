'use client';

import { deleteExpressionRuleAction } from '@/backend/contexts/expression-rule/presentation/actions/expression-rule.action';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteExpressionRuleButtonProps {
	ruleId: string;
	ngExpression: string;
}

export function DeleteExpressionRuleButton({
	ruleId,
	ngExpression,
}: DeleteExpressionRuleButtonProps) {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setError(null);
		setIsPending(true);

		try {
			await deleteExpressionRuleAction(ruleId);
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : '削除に失敗しました。');
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">削除</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>表現ルールを削除</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">
					「<span className="font-medium text-foreground">{ngExpression}</span>
					」を削除します。この操作は取り消せません。
				</p>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => setOpen(false)}>
						キャンセル
					</Button>
					<Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
						{isPending ? '削除中...' : '削除'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
