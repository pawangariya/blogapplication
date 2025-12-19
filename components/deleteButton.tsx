"use client";
import { deleteArticle } from "@/app/actions/delete-article";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";

export default function DeleteButton({ articleId }: { articleId: string }) {
  const { pending } = useFormStatus();

  return (
    <form action={deleteArticle}>
      <input type="hidden" name="articleId" value={articleId} />
      <Button type="submit" disabled={pending} variant="ghost" size="sm">
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
}
