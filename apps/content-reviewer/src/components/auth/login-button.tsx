'use client';

import { signInWithGoogle } from '@/backend/contexts/auth/presentation/actions/sign-in.action';
import { Button } from '@/components/ui/button';

export function LoginButton() {
	return (
		<form action={signInWithGoogle}>
			<Button type="submit" size="lg" className="w-full">
				Google でログイン
			</Button>
		</form>
	);
}
