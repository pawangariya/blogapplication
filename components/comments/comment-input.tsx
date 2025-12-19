"use client";

declare global {
  interface Window {
    openAuthDialog: (isLogin?: boolean) => void;
  }
}

import React, { useActionState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createComments } from "@/app/actions/create-comment";

type CommentFormProps = {
  articleId: string;
};

const CommentInput: React.FC<CommentFormProps> = ({ articleId }) => {
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const createCommentAction = createComments.bind(null, articleId);

  const [formState, action, isPending] = useActionState(createCommentAction, {
    errors: {},
  });

  // 🔥 NOT LOGGED IN → OPEN GLOBAL LOGIN DIALOG
  useEffect(() => {
    if (formState?.notLoggedIn) {
      window.openAuthDialog(true);
    }
  }, [formState]);

  return (
    <form action={action} className="mb-8">
      <div className="flex  gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/current-user-avatar.jpg" />
          <AvatarFallback className="bg-blue-500 text-white">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 ">
          <div className="relative">
            <Input
            placeholder="Add a comment..."
            name="body"
            className="py-6 text-base"
          />

          <Button disabled={isPending} type="submit" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-12">
              {isPending ? "Loading..." : "Post Comment"}
            </Button>

          {formState.errors?.body && (
            <p className="text-red-600 text-sm font-medium mt-1">
              {formState.errors.body}
            </p>
          )}
            
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
