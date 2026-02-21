declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ContentCheckId = string & { readonly [brand]: 'ContentCheckId' };

export function createContentCheckId(value: string): ContentCheckId {
	if (!value || value.trim().length === 0) {
		throw new Error('ContentCheckId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`ContentCheckId must be a valid UUID: ${value}`);
	}

	return value as ContentCheckId;
}
