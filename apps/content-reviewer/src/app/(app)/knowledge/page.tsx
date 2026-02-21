import { loadKnowledgeArticles } from '@/backend/contexts/knowledge/presentation/loaders/knowledge-articles.loader';
import { KnowledgeArticleFormDialog } from '@/components/knowledge/knowledge-article-form-dialog';
import { KnowledgeArticleTable } from '@/components/knowledge/knowledge-article-table';

export default async function KnowledgePage() {
	const articles = await loadKnowledgeArticles();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">ナレッジ記事管理</h1>
					<p className="text-muted-foreground text-sm mt-1">
						コンテンツチェックで参照するナレッジ記事を管理します。
					</p>
				</div>
				<KnowledgeArticleFormDialog />
			</div>
			<KnowledgeArticleTable articles={articles} />
		</div>
	);
}
