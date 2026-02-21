'use client';

import type { NoteArticleSummary } from '@/backend/contexts/knowledge/domain/gateways/note-scraper.gateway';
import { importNoteArticlesAction } from '@/backend/contexts/knowledge/presentation/actions/import-note-articles.action';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NoteArticleListProps {
	articles: NoteArticleSummary[];
	accountName: string;
}

export function NoteArticleList({ articles, accountName }: NoteArticleListProps) {
	const router = useRouter();
	const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCheck = (url: string, checked: boolean) => {
		setSelectedUrls((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(url);
			} else {
				next.delete(url);
			}
			return next;
		});
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUrls(new Set(articles.map((a) => a.url)));
		} else {
			setSelectedUrls(new Set());
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUrls.size === 0) return;

		setError(null);
		setIsPending(true);

		try {
			const formData = new FormData();
			formData.append('accountName', accountName);
			for (const url of selectedUrls) {
				formData.append('selectedUrls', url);
			}
			await importNoteArticlesAction(formData);
			router.push('/knowledge');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'インポートに失敗しました。');
			setIsPending(false);
		}
	};

	if (articles.length === 0) {
		return (
			<p className="text-muted-foreground text-sm py-8 text-center">記事が見つかりませんでした。</p>
		);
	}

	const allSelected = selectedUrls.size === articles.length;

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={(e) => handleSelectAll(e.target.checked)}
								aria-label="すべて選択"
							/>
						</TableHead>
						<TableHead>タイトル</TableHead>
						<TableHead>公開日</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{articles.map((article) => (
						<TableRow key={article.url}>
							<TableCell>
								<input
									type="checkbox"
									name="selectedUrls"
									value={article.url}
									checked={selectedUrls.has(article.url)}
									onChange={(e) => handleCheck(article.url, e.target.checked)}
									aria-label={article.title}
								/>
							</TableCell>
							<TableCell className="font-medium">
								<a
									href={article.url}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									{article.title}
								</a>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{article.publishedAt.toLocaleDateString('ja-JP')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">{selectedUrls.size} 件選択中</p>
				<Button type="submit" disabled={isPending || selectedUrls.size === 0}>
					{isPending ? 'インポート中...' : `選択した記事をインポート (${selectedUrls.size}件)`}
				</Button>
			</div>
		</form>
	);
}
