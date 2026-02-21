import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppShellLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-12 items-center border-b px-4">
					<SidebarTrigger />
				</header>
				<div className="flex-1 p-6">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
