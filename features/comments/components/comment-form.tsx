"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment, createReply } from "@/features/comments/actions";

export function CommentForm({
  videoId,
  commentId,
  avatarUrl,
  placeholder = "Add a comment…",
  onDone,
}: {
  videoId?: string;
  commentId?: string;
  avatarUrl?: string | null;
  placeholder?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [content, setContent] = useState("");

  function submit() {
    if (!content.trim()) return;
    start(async () => {
      const res = commentId
        ? await createReply({ commentId, content })
        : await createComment({ videoId, content });
      if (!res.ok) {
        toast.error(res.error ?? "Could not post");
        return;
      }
      setContent("");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3">
      <Avatar src={avatarUrl} size={36} className="mt-1" />
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-10"
        />
        <div className="flex justify-end gap-2">
          {onDone && (
            <Button variant="ghost" size="sm" onClick={onDone}>
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={submit} disabled={pending || !content.trim()}>
            {commentId ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
