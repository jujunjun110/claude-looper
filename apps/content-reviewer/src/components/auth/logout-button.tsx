'use client';

import { signOutAction } from '@/backend/contexts/auth/presentation/actions/sign-out.action';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
	return (
		<form action={signOutAction}>
			<Button type="submit" variant="ghost" size="sm">
				<LogOut className="size-4" />
				<span>ログアウト</span>
			</Button>
		</form>
	);
}
