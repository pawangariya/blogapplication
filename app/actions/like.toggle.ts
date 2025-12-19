"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

export async function toggleLike(articleId: string) {
  const token = (await cookies()).get("authToken")?.value ?? null;

  if (!token) {
    return { success: false, notLoggedIn: true, message: "Please login first" };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return { success: false, notLoggedIn: true, message: "Invalid login token" };
  }

  const userId = decoded.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { success: false, notLoggedIn: true, message: "User not found" };
  }

  const existingLike = await prisma.like.findFirst({
    where: { articleId, userId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({ data: { articleId, userId } });
  }

  revalidatePath(`/article/${articleId}`);

  return { success: true, notLoggedIn: false };
}
