import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import LikeButton from "./like-button";
import CommentInput from "../comments/comment-input";
import CommentList from "../comments/comments-list";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import TopArticles from "../home/top-articles";

type ArticleDetailPageProps = {
  article: Prisma.ArticlesGetPayload<{
    include: {
      author: {
        select: {
          username: true;
          email: true;
          imageUrl: true;
        };
      };
    };
  }>;
};

export async function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  // 🔹 1. JWT Token Read
  const token = (await cookies()).get("token")?.value  ?? null;

  let currentUserId: string | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      currentUserId = decoded.id;
    } catch {
      currentUserId = null;
    }
  }

  // 🔹 2. Find Logged-In User in DB
  const currentUser = currentUserId
    ? await prisma.user.findUnique({ where: { id: currentUserId } })
    : null;

  // 🔹 3. Fetch Comments
  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    include: {
      author: {
        select: {
          username: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });

  // 🔹 4. Fetch Likes
  const likes = await prisma.like.findMany({
    where: { articleId: article.id },
  });

  // 🔹 5. Check If Current User Liked This Article
  const isLiked = currentUser
    ? likes.some((like) => like.userId === currentUser.id)
    : false;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl">
          {/* HEADER */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {article.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.imageUrl as string} />
                <AvatarFallback>{article.id}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {article.author.username}
                </p>
                <p className="text-sm">
                  {article.createdAt.toDateString()} · {12} min read
                </p>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <section
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* LIKE BUTTON */}
          <LikeButton articleId={article.id} likes={likes} isLiked={isLiked} />

          {/* COMMENTS */}
          <Card className="p-6 max-w-none">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {comments.length} Comments
              </h2>
            </div>

            {/* COMMENT INPUT */}
            <CommentInput articleId={article.id} />

            {/* COMMENTS LIST */}
            <CommentList comments={comments} />
          </Card>
        </article>
        <div className="gap-4">
           <h1 className="text-center font-bold text-4xl pt-10 pb-10">Discover more</h1>
           <TopArticles excludeArticleId={article.id} />

        </div>
      </main>
    </div>
  );
}
