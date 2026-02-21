'use client';

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
	SidebarRail,
} from '@/components/ui/sidebar';
import { BookOpen, ClipboardCheck, LayoutDashboard, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
	{ title: 'ダッシュボード', href: '/', icon: LayoutDashboard },
	{ title: 'チェック実行', href: '/checks/new', icon: ClipboardCheck },
	{ title: '表現ルール', href: '/rules', icon: ShieldAlert },
	{ title: 'ナレッジ', href: '/knowledge', icon: BookOpen },
] as const;

export function SidebarNav() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="border-b px-4 py-3">
				<span className="text-base font-bold">Content Reviewer</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>メニュー</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
										tooltip={item.title}
									>
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
			<SidebarRail />
		</Sidebar>
	);
}
