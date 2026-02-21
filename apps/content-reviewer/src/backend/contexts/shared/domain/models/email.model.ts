type Result<T, E> = { success: true; value: T } | { success: false; error: E };

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class Email {
	private constructor(readonly value: string) {}

	static create(value: string): Result<Email, string> {
		const trimmed = value.trim().toLowerCase();

		if (trimmed.length === 0) {
			return { success: false, error: 'Email cannot be empty' };
		}

		if (!EMAIL_REGEX.test(trimmed)) {
			return { success: false, error: `Invalid email format: ${value}` };
		}

		return { success: true, value: new Email(trimmed) };
	}

	equals(other: Email): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
