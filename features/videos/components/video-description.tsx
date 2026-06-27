"use client";

import { useState } from "react";
import { formatCompact } from "@/lib/utils";
import { timeAgo } from "@/lib/format";

export function VideoDescription({
  description,
  views,
  createdAt,
}: {
  description: string | null;
  views: number;
  createdAt: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = description ?? "";
  const isLong = text.length > 200;

  return (
    <div className="rounded-xl bg-secondary/60 p-3 text-sm">
      <p className="font-medium">
        {formatCompact(views)} views · {timeAgo(createdAt)}
      </p>
      {text && (
        <>
          <p
            className={
              "mt-2 whitespace-pre-wrap " + (expanded ? "" : "line-clamp-3")
            }
          >
            {text}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
