import type { ExpressionRuleId } from '@/backend/contexts/shared/domain/models/expression-rule-id.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';

type Result<T, E> = { success: true; value: T } | { success: false; error: E };

export interface ExpressionRuleProps {
	readonly id: ExpressionRuleId;
	readonly ngExpression: string;
	readonly recommendedExpression: string;
	readonly description: string | null;
	readonly isActive: boolean;
	readonly createdBy: UserId;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export class ExpressionRule {
	readonly id: ExpressionRuleId;
	readonly ngExpression: string;
	readonly recommendedExpression: string;
	readonly description: string | null;
	readonly isActive: boolean;
	readonly createdBy: UserId;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	private constructor(props: ExpressionRuleProps) {
		this.id = props.id;
		this.ngExpression = props.ngExpression;
		this.recommendedExpression = props.recommendedExpression;
		this.description = props.description;
		this.isActive = props.isActive;
		this.createdBy = props.createdBy;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(props: {
		id: ExpressionRuleId;
		ngExpression: string;
		recommendedExpression: string;
		description?: string | null;
		createdBy: UserId;
		createdAt?: Date;
		updatedAt?: Date;
	}): Result<ExpressionRule, string> {
		if (!props.ngExpression || props.ngExpression.trim().length === 0) {
			return { success: false, error: 'NG expression cannot be empty' };
		}

		if (!props.recommendedExpression || props.recommendedExpression.trim().length === 0) {
			return { success: false, error: 'Recommended expression cannot be empty' };
		}

		const now = new Date();
		return {
			success: true,
			value: new ExpressionRule({
				id: props.id,
				ngExpression: props.ngExpression.trim(),
				recommendedExpression: props.recommendedExpression.trim(),
				description: props.description?.trim() || null,
				isActive: true,
				createdBy: props.createdBy,
				createdAt: props.createdAt ?? now,
				updatedAt: props.updatedAt ?? now,
			}),
		};
	}

	static reconstruct(props: ExpressionRuleProps): ExpressionRule {
		return new ExpressionRule(props);
	}

	update(props: {
		ngExpression: string;
		recommendedExpression: string;
		description?: string | null;
	}): Result<ExpressionRule, string> {
		if (!props.ngExpression || props.ngExpression.trim().length === 0) {
			return { success: false, error: 'NG expression cannot be empty' };
		}

		if (!props.recommendedExpression || props.recommendedExpression.trim().length === 0) {
			return { success: false, error: 'Recommended expression cannot be empty' };
		}

		return {
			success: true,
			value: new ExpressionRule({
				id: this.id,
				ngExpression: props.ngExpression.trim(),
				recommendedExpression: props.recommendedExpression.trim(),
				description: props.description?.trim() || null,
				isActive: this.isActive,
				createdBy: this.createdBy,
				createdAt: this.createdAt,
				updatedAt: new Date(),
			}),
		};
	}

	deactivate(): ExpressionRule {
		return new ExpressionRule({
			...this.toProps(),
			isActive: false,
			updatedAt: new Date(),
		});
	}

	activate(): ExpressionRule {
		return new ExpressionRule({
			...this.toProps(),
			isActive: true,
			updatedAt: new Date(),
		});
	}

	private toProps(): ExpressionRuleProps {
		return {
			id: this.id,
			ngExpression: this.ngExpression,
			recommendedExpression: this.recommendedExpression,
			description: this.description,
			isActive: this.isActive,
			createdBy: this.createdBy,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
