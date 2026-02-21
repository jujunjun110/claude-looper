import { LoginButton } from '@/components/auth/login-button';

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center">
			<div className="flex w-full max-w-sm flex-col items-center gap-6">
				<h1 className="text-2xl font-bold">Content Reviewer</h1>
				<p className="text-muted-foreground text-sm">ログインして利用を開始してください</p>
				<LoginButton />
			</div>
		</main>
	);
}
