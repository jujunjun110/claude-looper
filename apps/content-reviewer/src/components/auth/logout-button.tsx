'use client';

import { signOut } from '@/backend/contexts/auth/presentation/actions/sign-out.action';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
	return (
		<form action={signOut}>
			<Button type="submit" variant="ghost" size="sm">
				<LogOut className="size-4" />
				<span>ログアウト</span>
			</Button>
		</form>
	);
}
