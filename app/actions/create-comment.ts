"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createComments(
  articleId: string,
  prevState: any,
  formData: FormData
) {
  const cookieStore = await cookies(); 
  const authToken = cookieStore.get("authToken")?.value || null;

  
  if (!authToken) {
    return { notLoggedIn: true };
  }

  let user: { id: string };
  try {
    user = jwt.verify(authToken, process.env.JWT_SECRET!) as { id: string };
  } catch {
    return { notLoggedIn: true };
  }

  const body = formData.get("body");
  if (!body || body.toString().trim() === "") {
    return { errors: { body: ["Comment cannot be empty"] } };
  }

  await prisma.comment.create({
    data: {
      body: body.toString(),
      articleId,
      authorId: user.id,
    },
  });

  revalidatePath(`/article/${articleId}`);
  return { errors: {} };
}
