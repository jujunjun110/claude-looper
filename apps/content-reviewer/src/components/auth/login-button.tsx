'use client';

import { signInAction } from '@/backend/contexts/auth/presentation/actions/sign-in.action';
import { Button } from '@/components/ui/button';

export function LoginButton() {
	return (
		<form action={signInAction}>
			<Button type="submit" size="lg" className="w-full">
				Google でログイン
			</Button>
		</form>
	);
}
