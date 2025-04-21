import ChatLayout from "@/components/chat/ChatLayout";
import PreferencesTab from "@/components/PreferencesTab";
import { User } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getLocalKindeServerSession } from "@/lib/auth-local";

// Use local auth in development, Kinde in production
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
const getAuthSession = isLocalDev ? getLocalKindeServerSession : getKindeServerSession;

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getUsers(): Promise<User[]> {
	try {
		const userKeys: string[] = [];
		let cursor = "0";

		// Only include keys that match user:* but don't include :conversations suffix
		do {
			const [nextCursor, keys] = await redis.scan(cursor, { match: "user:*", count: 100 });
			cursor = nextCursor;
			// Filter out user:*:conversations keys to avoid type mismatches
			const filteredKeys = keys.filter(key => 
				!key.includes(':conversations') && 
				!key.includes(':messages')
			);
			userKeys.push(...filteredKeys);
		} while (cursor !== "0");

		const { getUser } = getAuthSession();
		const currentUser = await getUser();

		if (userKeys.length === 0) {
			console.log('No user keys found in Redis');
			return [];
		}

		// Check each key's type before adding to pipeline
		const validUserKeys: string[] = [];
		for (const key of userKeys) {
			try {
				const keyType = await redis.type(key);
				if (keyType === 'hash') {
					validUserKeys.push(key);
				}
			} catch (err) {
				console.error(`Error checking type for key ${key}:`, err);
			}
		}

		if (validUserKeys.length === 0) {
			console.log('No valid hash user keys found');
			return [];
		}

		const pipeline = redis.pipeline();
		validUserKeys.forEach((key) => pipeline.hgetall(key));
		const results = (await pipeline.exec()) as User[];

		const users: User[] = [];
		for (const user of results) {
			// Ensure user is valid and exclude current user
			if (user && user.id && user.id !== currentUser?.id) {
				users.push(user);
			}
		}
		return users;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
}

export default async function Home() {
	const layout = cookies().get("react-resizable-panels:layout");
	const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

	const { isAuthenticated } = getAuthSession();
	if (!(await isAuthenticated())) {
		return redirect(isLocalDev ? "/local-auth" : "/auth");
	}

	let users: User[] = [];
	try {
		users = await getUsers();
	} catch (error) {
		console.error('Failed to get users:', error);
		// Continue with empty users array if there's an error
	}

	return (
		<main className='flex h-screen flex-col items-center justify-center p-4 md:px-24 py-32 gap-4'>
			<PreferencesTab />

			{/* dotted bg */}
			<div
				className='absolute top-0 z-[-2] h-screen w-screen dark:bg-[#000000] dark:bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] 
				dark:bg-[size:20px_20px] bg-[#ffffff] bg-[radial-gradient(#00000033_1px,#ffffff_1px)] bg-[size:20px_20px]'
				aria-hidden='true'
			/>

			<div className='z-10 border rounded-lg max-w-5xl w-full min-h-[85vh] text-sm lg:flex'>
				<ChatLayout defaultLayout={defaultLayout} users={users} />
			</div>
		</main>
	);
}
