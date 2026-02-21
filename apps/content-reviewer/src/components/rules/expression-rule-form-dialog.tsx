'use client';

import {
	createExpressionRuleAction,
	updateExpressionRuleAction,
} from '@/backend/contexts/expression-rule/presentation/actions/expression-rule.action';
import type { ExpressionRuleDTO } from '@/backend/contexts/expression-rule/presentation/loaders/expression-rule.loader';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';

interface ExpressionRuleFormDialogProps {
	rule?: ExpressionRuleDTO;
}

export function ExpressionRuleFormDialog({ rule }: ExpressionRuleFormDialogProps) {
	const isEdit = rule !== undefined;
	const [open, setOpen] = useState(false);
	const [ngExpression, setNgExpression] = useState(rule?.ngExpression ?? '');
	const [recommendedExpression, setRecommendedExpression] = useState(
		rule?.recommendedExpression ?? '',
	);
	const [description, setDescription] = useState(rule?.description ?? '');
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setNgExpression(rule?.ngExpression ?? '');
			setRecommendedExpression(rule?.recommendedExpression ?? '');
			setDescription(rule?.description ?? '');
			setError(null);
		}
		setOpen(nextOpen);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsPending(true);

		try {
			if (isEdit && rule) {
				await updateExpressionRuleAction({
					id: rule.id,
					ngExpression,
					recommendedExpression,
					description: description || null,
				});
			} else {
				await createExpressionRuleAction({
					ngExpression,
					recommendedExpression,
					description: description || null,
				});
			}
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : '保存に失敗しました。');
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{isEdit ? (
					<Button variant="ghost" size="sm">
						<Pencil className="h-4 w-4" />
						<span className="sr-only">編集</span>
					</Button>
				) : (
					<Button>
						<Plus className="h-4 w-4 mr-1" />
						新規登録
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? '表現ルールを編集' : '表現ルールを新規登録'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="ngExpression">NG表現 *</Label>
						<Input
							id="ngExpression"
							value={ngExpression}
							onChange={(e) => setNgExpression(e.target.value)}
							placeholder="例: 〜させていただく"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="recommendedExpression">推奨表現 *</Label>
						<Input
							id="recommendedExpression"
							value={recommendedExpression}
							onChange={(e) => setRecommendedExpression(e.target.value)}
							placeholder="例: 〜します"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">補足説明</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="このルールの背景や使用例を入力してください（任意）"
							rows={3}
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							キャンセル
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? '保存中...' : '保存'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
