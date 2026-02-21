'use client';

import { createKnowledgeArticleAction } from '@/backend/contexts/knowledge/presentation/actions/create-knowledge-article.action';
import { updateKnowledgeArticleAction } from '@/backend/contexts/knowledge/presentation/actions/update-knowledge-article.action';
import type { KnowledgeArticleDTO } from '@/backend/contexts/knowledge/presentation/loaders/knowledge-articles.loader';
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

interface KnowledgeArticleFormDialogProps {
	article?: KnowledgeArticleDTO;
}

export function KnowledgeArticleFormDialog({ article }: KnowledgeArticleFormDialogProps) {
	const isEdit = article !== undefined;
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(article?.title ?? '');
	const [content, setContent] = useState(article?.content ?? '');
	const [sourceUrl, setSourceUrl] = useState(article?.sourceUrl ?? '');
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setTitle(article?.title ?? '');
			setContent(article?.content ?? '');
			setSourceUrl(article?.sourceUrl ?? '');
			setError(null);
		}
		setOpen(nextOpen);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsPending(true);

		try {
			const formData = new FormData();
			if (isEdit && article) {
				formData.append('id', article.id);
				formData.append('title', title);
				formData.append('content', content);
				await updateKnowledgeArticleAction(formData);
			} else {
				formData.append('title', title);
				formData.append('content', content);
				formData.append('sourceType', 'manual');
				if (sourceUrl) {
					formData.append('sourceUrl', sourceUrl);
				}
				await createKnowledgeArticleAction(formData);
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
			<DialogContent className="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? 'ナレッジ記事を編集' : 'ナレッジ記事を新規登録'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">タイトル *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="例: 表現ガイドライン"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="content">内容 *</Label>
						<Textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="ナレッジの内容を入力してください"
							rows={6}
							required
						/>
					</div>
					{!isEdit && (
						<div className="space-y-2">
							<Label htmlFor="sourceUrl">ソースURL</Label>
							<Input
								id="sourceUrl"
								value={sourceUrl}
								onChange={(e) => setSourceUrl(e.target.value)}
								placeholder="https://example.com/article（任意）"
								type="url"
							/>
						</div>
					)}
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
