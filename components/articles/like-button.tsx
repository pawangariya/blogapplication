"use client";

declare global {
  interface Window {
    openAuthDialog: (isLogin?: boolean) => void;
  }
}

import { Button } from "@/components/ui/button";
import { Bookmark, Share2, ThumbsUp } from "lucide-react";
import React, { useOptimistic, useTransition, useState } from "react";

import type { Like } from "@prisma/client";
import { toggleLike } from "@/app/actions/like.toggle";



type LikeButtonProps = {
  articleId: string;
  likes: Like[];
  isLiked: boolean;
};
const handleShare = async () => {
  const shareData = {
    title: document.title,
    text: " check out this article",
    url: window.location.href,
  };
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  }
};

 

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, likes, isLiked }) => {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes.length);
  const [isPending, startTransition] = useTransition();

  
  const handleLike = async () => {
    startTransition(async () => {
      const res: { success: boolean; notLoggedIn?: boolean } =
        await toggleLike(articleId);

      if (res.notLoggedIn) {
        window.openAuthDialog(true); //  Popup open karo
        return;
      }

      setOptimisticLikes(isLiked ? optimisticLikes - 1 : optimisticLikes + 1);
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-12 border-t pt-8">
        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={handleLike}
            disabled={isPending}
          >
            <ThumbsUp className="h-5 w-5" />
            {optimisticLikes}
          </Button>

          <Button variant="ghost" className="gap-2">
            <Bookmark className="h-5 w-5" /> Save
          </Button>

          <Button variant="ghost" className="gap-2" onClick={handleShare}>
            <Share2 className="h-5 w-5" /> Share
          </Button>
        </div>
      </div>
    </>
  );
};

export default LikeButton;
