import Link from "next/link";
import { getComments } from "@/features/comments/queries";
import { getCurrentProfile } from "@/lib/auth";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

/** Server component: loads comments and renders the thread + composer. */
export async function CommentsSection({ videoId }: { videoId: string }) {
  const [comments, profile] = await Promise.all([
    getComments(videoId),
    getCurrentProfile(),
  ]);

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-semibold">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {profile ? (
        <CommentForm videoId={videoId} avatarUrl={profile.avatar_url} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <div className="space-y-5">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            currentUserAvatar={profile?.avatar_url}
            isAuthed={Boolean(profile)}
          />
        ))}
      </div>
    </section>
  );
}
