'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';
import { Header } from './header';
import { SidebarNav } from './sidebar-nav';

export function AppShell({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<SidebarNav />
			<SidebarInset>
				<Header />
				<main className="flex-1 p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
