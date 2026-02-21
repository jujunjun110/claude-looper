import { loadCurrentUser } from '@/backend/contexts/auth/presentation/loaders/current-user.loader';
import { AppSidebar } from '@/components/app-sidebar';
import { LogoutButton } from '@/components/auth/logout-button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default async function AppShellLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await loadCurrentUser();

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-12 items-center justify-between border-b px-4">
					<SidebarTrigger />
					<div className="flex items-center gap-3">
						{user && <span className="text-muted-foreground text-sm">{user.name}</span>}
						<LogoutButton />
					</div>
				</header>
				<div className="flex-1 p-6">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
