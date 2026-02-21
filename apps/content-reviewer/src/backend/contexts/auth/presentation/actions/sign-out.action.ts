'use server';

import { createSignOutUseCase } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { redirect } from 'next/navigation';

export async function signOutAction(): Promise<never> {
	if (process.env.NODE_ENV === 'development') {
		redirect('/login');
	}

	const useCase = await createSignOutUseCase();
	await useCase.execute();

	redirect('/login');
}
