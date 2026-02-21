'use client';

import { BookOpen, ClipboardCheck, Download, Home, ListChecks, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

const mainNavItems = [
	{ title: 'ダッシュボード', href: '/', icon: Home },
	{ title: '新規チェック', href: '/checks/new', icon: PlusCircle },
];

const managementNavItems = [
	{ title: '表現ルール', href: '/rules', icon: ListChecks },
	{ title: 'ナレッジ', href: '/knowledge', icon: BookOpen },
	{ title: 'ナレッジ取込', href: '/knowledge/import', icon: Download },
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-1">
					<ClipboardCheck className="size-5" />
					<span className="font-semibold">Content Reviewer</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>メイン</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<Link href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>管理</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{managementNavItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<Link href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
