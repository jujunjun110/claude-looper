'use server';

import { createSignInUseCase } from '@/backend/contexts/auth/presentation/composition/auth.composition';
import { redirect } from 'next/navigation';

export async function signInAction(): Promise<never> {
	const useCase = await createSignInUseCase();

	const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
	const redirectTo = `${origin}/auth/callback`;

	const { url } = await useCase.execute(redirectTo);

	redirect(url);
}
