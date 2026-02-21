declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ContentSegmentId = string & { readonly [brand]: 'ContentSegmentId' };

export function createContentSegmentId(value: string): ContentSegmentId {
	if (!value || value.trim().length === 0) {
		throw new Error('ContentSegmentId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`ContentSegmentId must be a valid UUID: ${value}`);
	}

	return value as ContentSegmentId;
}
