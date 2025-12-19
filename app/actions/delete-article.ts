"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteArticle(formData: FormData) {
  const articleId = formData.get("articleId") as string;

  // Delete related likes & comments first
  await prisma.like.deleteMany({ where: { articleId } });
  await prisma.comment.deleteMany({ where: { articleId } });
  await prisma.articles.delete({ where: { id: articleId } });

  // Revalidate the dashboard or page where articles are listed
  revalidatePath("/dashboard"); // or the route where the articles are rendered
}
