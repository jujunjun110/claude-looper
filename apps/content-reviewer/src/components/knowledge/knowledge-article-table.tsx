'use client';

import type { KnowledgeArticleDTO } from '@/backend/contexts/knowledge/presentation/loaders/knowledge-articles.loader';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { DeleteKnowledgeArticleButton } from './delete-knowledge-article-button';
import { KnowledgeArticleFormDialog } from './knowledge-article-form-dialog';

interface KnowledgeArticleTableProps {
	articles: KnowledgeArticleDTO[];
}

export function KnowledgeArticleTable({ articles }: KnowledgeArticleTableProps) {
	if (articles.length === 0) {
		return (
			<p className="text-muted-foreground text-sm py-8 text-center">
				ナレッジ記事が登録されていません。
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>タイトル</TableHead>
					<TableHead>ソース種別</TableHead>
					<TableHead>作成日</TableHead>
					<TableHead className="text-right">操作</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{articles.map((article) => (
					<TableRow key={article.id}>
						<TableCell className="font-medium">{article.title}</TableCell>
						<TableCell>
							{article.sourceType === 'manual' ? (
								<Badge variant="default">手動</Badge>
							) : (
								<Badge variant="secondary">ノート</Badge>
							)}
						</TableCell>
						<TableCell className="text-muted-foreground">
							{new Date(article.createdAt).toLocaleDateString('ja-JP')}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex items-center justify-end gap-2">
								<KnowledgeArticleFormDialog article={article} />
								<DeleteKnowledgeArticleButton
									articleId={article.id}
									title={article.title}
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
