declare const brand: unique symbol;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CheckResultId = string & { readonly [brand]: 'CheckResultId' };

export function createCheckResultId(value: string): CheckResultId {
	if (!value || value.trim().length === 0) {
		throw new Error('CheckResultId cannot be empty');
	}

	if (!UUID_REGEX.test(value)) {
		throw new Error(`CheckResultId must be a valid UUID: ${value}`);
	}

	return value as CheckResultId;
}
