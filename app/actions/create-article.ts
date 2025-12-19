"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Zod Schema
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

export const createArticle = async (
  prevState: CreateArticlesFormstate,
  formData: FormData
): Promise<CreateArticlesFormstate> => {
  // 1) Validate fields
  const result = createArticleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // 2) Read auth token
  const token = formData.get("authToken") as string | null;
  if (!token) {
    return { errors: { formErros: ["You must login first"] } };
  }

  // 3) Decode JWT and get user
  let existingUser;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id?: string;
      email?: string;
    };

    if (decoded.id) {
      existingUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.email) {
      existingUser = await prisma.user.findUnique({
        where: { email: decoded.email },
      });
    } else {
      return { errors: { formErros: ["Invalid token: no id or email"] } };
    }
  } catch (err) {
    return { errors: { formErros: ["Invalid or expired token"] } };
  }

  if (!existingUser) {
    return {
      errors: {
        formErros: ["User not found. Register before creating an article"],
      },
    };
  }
  if (existingUser.role !== "admin") {
    return {
      errors: {
        formErros: ["Permission denied!"],
      },
    };
  }

  // 4) Upload featured image
  const imageFile = formData.get("featuredImage") as File | null;

  if (!imageFile || imageFile.name === "undefined") {
    return { errors: { featuredImage: ["Image file is required"] } };
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResponse: UploadApiResponse | undefined = await new Promise(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
      uploadStream.end(buffer);
    }
  );

  const imageUrl = uploadResponse?.secure_url;

  if (!imageUrl) {
    return {
      errors: { featuredImage: ["Failed to upload image. Please try again"] },
    };
  }

  // 5) Create Article (MODEL NAME CORRECT: Articles)
  try {
    await prisma.articles.create({
      data: {
        title: result.data.title,
        category: result.data.category,
        content: result.data.content,
        featuredImage: imageUrl,
        authorId: existingUser.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { errors: { formErros: [error.message] } };
    }
    return {
      errors: { formErros: ["Some internal server error occurred"] },
    };
  }

  // 6) Revalidate and redirect
  revalidatePath("/dashboard");
  redirect("/dashboard");

  return { errors: {} };
};
