"use server";

import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getLocalKindeServerSession } from "@/lib/auth-local";

// Use local auth in development, Kinde in production
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
const getAuthSession = isLocalDev ? getLocalKindeServerSession : getKindeServerSession;

export async function checkAuthStatus() {
	const { getUser } = getAuthSession();
	const user = await getUser();

	if (!user) return { success: false };

	// namespaces are really important to understand in redis
	const userId = `user:${user.id}`;

	const existingUser = await redis.hgetall(userId);

	// sign up case: bc user is visiting our platform for the first time
	if (!existingUser || Object.keys(existingUser).length === 0) {
		const imgIsNull = user.picture?.includes("gravatar");
		const image = imgIsNull ? "" : user.picture;

		await redis.hset(userId, {
			id: user.id,
			email: user.email,
			name: `${user.given_name} ${user.family_name}`,
			image: image,
		});
	}

	return { success: true };
}
