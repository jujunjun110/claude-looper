import type { KnowledgeArticleId } from '@/backend/contexts/shared/domain/models/knowledge-article-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

export type KnowledgeArticleSourceType = 'manual' | 'note';

export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface KnowledgeArticleProps {
	readonly id: KnowledgeArticleId;
	readonly title: string;
	readonly content: string;
	readonly sourceType: KnowledgeArticleSourceType;
	readonly sourceUrl: string | null;
	readonly createdBy: UserId;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export class KnowledgeArticle {
	readonly id: KnowledgeArticleId;
	readonly title: string;
	readonly content: string;
	readonly sourceType: KnowledgeArticleSourceType;
	readonly sourceUrl: string | null;
	readonly createdBy: UserId;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	private constructor(props: KnowledgeArticleProps) {
		this.id = props.id;
		this.title = props.title;
		this.content = props.content;
		this.sourceType = props.sourceType;
		this.sourceUrl = props.sourceUrl;
		this.createdBy = props.createdBy;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(props: {
		id: KnowledgeArticleId;
		title: string;
		content: string;
		sourceType: KnowledgeArticleSourceType;
		sourceUrl?: string | null;
		createdBy: UserId;
		createdAt?: Date;
		updatedAt?: Date;
	}): Result<KnowledgeArticle, string> {
		if (!props.title || props.title.trim().length === 0) {
			return { success: false, error: 'Title cannot be empty' };
		}

		if (!props.content || props.content.trim().length === 0) {
			return { success: false, error: 'Content cannot be empty' };
		}

		const now = new Date();
		return {
			success: true,
			value: new KnowledgeArticle({
				id: props.id,
				title: props.title.trim(),
				content: props.content,
				sourceType: props.sourceType,
				sourceUrl: props.sourceUrl ?? null,
				createdBy: props.createdBy,
				createdAt: props.createdAt ?? now,
				updatedAt: props.updatedAt ?? now,
			}),
		};
	}

	static reconstruct(props: KnowledgeArticleProps): KnowledgeArticle {
		return new KnowledgeArticle(props);
	}

	update(props: { title: string; content: string }): Result<KnowledgeArticle, string> {
		if (!props.title || props.title.trim().length === 0) {
			return { success: false, error: 'Title cannot be empty' };
		}

		if (!props.content || props.content.trim().length === 0) {
			return { success: false, error: 'Content cannot be empty' };
		}

		return {
			success: true,
			value: new KnowledgeArticle({
				id: this.id,
				title: props.title.trim(),
				content: props.content,
				sourceType: this.sourceType,
				sourceUrl: this.sourceUrl,
				createdBy: this.createdBy,
				createdAt: this.createdAt,
				updatedAt: new Date(),
			}),
		};
	}
}
