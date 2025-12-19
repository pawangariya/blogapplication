import type { Prisma } from "@prisma/client";
import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

type CommentListProps = {
  comments: Prisma.CommentGetPayload<{
    include: {
      author: {
        select: {
          username: true;
        };
      };
    };
  }>[];
};

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          {/* Avatar with first letter only */}
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {comment.author.username ? comment.author.username.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-2">
              <span className="font-medium text-foreground">
                {comment.author.username}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {comment.createdAt.toDateString()}
              </span>
            </div>
            <p className="text-muted-foreground">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
