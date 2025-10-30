import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "~/lib/auth/get-user";
import { HomeContent } from "./_main_content";

export default async function Home({
	searchParams: s,
}: { searchParams: Promise<{ redirect?: "false" | "true" }> }) {
	const authData = await getAuthenticatedUser();
	const fullUser = authData?.user ?? null;

	const searchParams = await s;

	if (fullUser && searchParams?.redirect !== "false") {
		redirect("/feed");
	}

	return <HomeContent />;
}
