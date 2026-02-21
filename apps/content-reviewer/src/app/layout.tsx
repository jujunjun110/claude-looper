import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Content Reviewer',
	description: 'SNS発信コンテンツの自動チェックシステム',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
