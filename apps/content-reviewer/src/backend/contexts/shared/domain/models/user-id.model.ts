declare const brand: unique symbol;

export type UserId = string & { readonly [brand]: 'UserId' };

export function createUserId(value: string): UserId {
	if (!value || value.trim().length === 0) {
		throw new Error('UserId cannot be empty');
	}
	return value as UserId;
}
