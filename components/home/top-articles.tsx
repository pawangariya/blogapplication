import React from 'react'
import { Card } from '../ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

type TopArticlesProps = {
  excludeArticleId?: string;
};

const TopArticles = async ({ excludeArticleId }: TopArticlesProps) => {
  const articles = await prisma.articles.findMany({
    where: excludeArticleId
      ? {
          id: {
            not: excludeArticleId, // 👈 CURRENT ARTICLE EXCLUDED
          },
        }
      : {},
    orderBy: {
      createdAt: "desc",
    },
    take: 3, // 👈 slice ki zarurat nahi
    include: {
      comments: true,
      author: {
        select: {
          username: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card
          key={article.id}
          className={cn(
            "relative overflow-hidden transition-all hover:scale-[1.02]",
            "border border-gray-200/50 dark:border-white/10",
            "bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg"
          )}
        >
          <div className="p-6">
            <Link href={`/articles/${article.id}`}>
              <div className="relative mb-4 h-20 sm:h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src={article.featuredImage}
                  height={200}
                  width={400}
                  alt="article"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.author.imageUrl as string} />
                  <AvatarFallback className='bg-blue-500 text-white'>
                    A
                  </AvatarFallback>
                </Avatar>
                <span>{article.author.username}</span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {article.title}
              </h3>

              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {article.category}
              </p>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{article.createdAt.toDateString()}</span>
                <span>{12} min to read</span>
              </div>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TopArticles;
