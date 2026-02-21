'use server';

import { createImportNoteArticlesUseCase } from '@/backend/contexts/knowledge/presentation/composition/knowledge-article.composition';
import { createUserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function importNoteArticlesAction(formData: FormData): Promise<void> {
	const selectedUrlsRaw = formData.getAll('selectedUrls');
	const accountName = formData.get('accountName');

	const selectedUrls = selectedUrlsRaw.filter((v): v is string => typeof v === 'string');

	if (selectedUrls.length === 0) {
		throw new Error('selectedUrls is required');
	}

	if (typeof accountName !== 'string' || accountName.length === 0) {
		throw new Error('accountName is required');
	}

	const createdBy = createUserId(
		process.env.NODE_ENV === 'development'
			? DUMMY_USER_ID
			: (process.env.SYSTEM_USER_ID ?? DUMMY_USER_ID),
	);

	const useCase = createImportNoteArticlesUseCase();
	await useCase.execute({ selectedUrls, createdBy });

	revalidatePath('/knowledge');
}
