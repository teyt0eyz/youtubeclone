"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { CommentForm } from "./comment-form";
import type { CommentWithAuthor } from "@/types";

export function CommentItem({
  comment,
  currentUserAvatar,
  isAuthed,
}: {
  comment: CommentWithAuthor;
  currentUserAvatar?: string | null;
  isAuthed: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const author = comment.author;
  const name = author?.display_name ?? author?.username ?? "User";

  return (
    <div className="flex gap-3">
      <Link href={author ? `/channel/${author.username}` : "#"}>
        <Avatar src={author?.avatar_url} alt={name} size={36} />
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.content}</p>

        {isAuthed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-2 text-xs"
            onClick={() => setReplying((v) => !v)}
          >
            Reply
          </Button>
        )}

        {replying && (
          <div className="mt-2">
            <CommentForm
              commentId={comment.id}
              avatarUrl={currentUserAvatar}
              placeholder="Add a reply…"
              onDone={() => setReplying(false)}
            />
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary"
              onClick={() => setShowReplies((v) => !v)}
            >
              {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </Button>
            {showReplies && (
              <div className="mt-2 space-y-3 border-l border-border pl-4">
                {comment.replies.map((r) => (
                  <div key={r.id} className="flex gap-2">
                    <Avatar
                      src={r.author?.avatar_url}
                      alt={r.author?.username ?? ""}
                      size={28}
                    />
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">
                          {r.author?.display_name ?? r.author?.username}
                        </span>
                        <span className="text-muted-foreground">
                          {timeAgo(r.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{r.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
