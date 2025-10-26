import { PageLayout } from "~/components/layouts/page-layout";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <PageLayout>{children}</PageLayout>;
}
