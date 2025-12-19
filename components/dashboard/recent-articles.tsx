"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import DeleteButton from "../deleteButton";

type RecentArticlesProps = {
  articles: Prisma.ArticlesGetPayload<{
    include: { comments: true; author: { select: { username: true; email: true; imageUrl: true } } };
  }>[];
};

export default function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Articles</CardTitle>
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            View All →
          </Button>
        </div>
      </CardHeader>
      {!articles.length ? (
        <CardContent>No article found</CardContent>
      ) : (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-green-100 text-green-600">
                      Published
                    </Badge>
                  </TableCell>
                  <TableCell>{article.comments.length}</TableCell>
                  <TableCell>{article.createdAt.toDateString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                    <DeleteButton articleId={article.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
