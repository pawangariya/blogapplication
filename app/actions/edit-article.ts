"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Zod schema to validate article data
const createArticleSchema = z.object({
  title: z.string().min(3).max(100),
  category: z.string().min(3).max(50),
  content: z.string().min(10),
});

type CreateArticlesFormstate = {
  errors: {
    title?: string[];
    category?: string[];
    featuredImage?: string[];
    content?: string[];
    formErros?: string[];
  };
};

export const editArticle = async (
  articleId: string,
  prevState: CreateArticlesFormstate,
  formData: FormData
): Promise<CreateArticlesFormstate> => {
  

  //  Validate form fields
  const result = createArticleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  //  Read JWT token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value ?? null;
  if (!token) return { errors: { formErros: ["You must login first"] } };

  //  Verify JWT
  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    userId = decoded.id;
  } catch (err) {
    return { errors: { formErros: ["Invalid or expired token"] } };
  }

  //  Check if article exists
  const existingArticle = await prisma.articles.findUnique({
    where: { id: articleId },
  });
  if (!existingArticle) return { errors: { formErros: ["Article not found"] } };

  //  Verify user exists and owns the article
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser || existingArticle.authorId !== existingUser.id) {
    return {
      errors: { formErros: ["You are not allowed to edit this article"] },
    };
  }

  //  Handle optional image upload
  let imageUrl = existingArticle.featuredImage;
  const imageFile = formData.get("featuredImage") as File | null;

  if (imageFile && imageFile.name !== "undefined") {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse: UploadApiResponse | undefined = await new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        }
      );

      if (uploadResponse?.secure_url) {
        imageUrl = uploadResponse.secure_url;
      } else {
        return {
          errors: { featuredImage: ["Failed to upload image. Try again."] },
        };
      }
    } catch (error) {
      return { errors: { formErros: ["Image upload failed. Try again."] } };
    }
  }

  //  Update article in Prisma
  try {
    await prisma.articles.update({
      where: { id: articleId },
      data: {
        title: result.data.title,
        category: result.data.category,
        content: result.data.content,
        featuredImage: imageUrl,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      return { errors: { formErros: [error.message] } };
    return {
      errors: { formErros: ["Internal server error while editing article"] },
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");

  return { errors: {} };
};
