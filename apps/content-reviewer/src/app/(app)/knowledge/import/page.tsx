import { loadNoteArticles } from '@/backend/contexts/knowledge/presentation/loaders/note-article-list.loader';
import { NoteArticleList } from '@/components/knowledge/note-article-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function KnowledgeImportPage({
	searchParams,
}: {
	searchParams: Promise<{ accountName?: string }>;
}) {
	const { accountName } = await searchParams;

	const articles = accountName ? await loadNoteArticles(accountName) : null;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">ノート記事取込</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Note.com のアカウントから記事をインポートします。
				</p>
			</div>
			<form method="GET" action="/knowledge/import" className="flex items-end gap-4">
				<div className="space-y-2">
					<Label htmlFor="accountName">アカウント名</Label>
					<Input
						id="accountName"
						name="accountName"
						defaultValue={accountName ?? ''}
						placeholder="例: username"
						required
					/>
				</div>
				<Button type="submit">記事を取得</Button>
			</form>
			{accountName && articles && <NoteArticleList articles={articles} accountName={accountName} />}
		</div>
	);
}
