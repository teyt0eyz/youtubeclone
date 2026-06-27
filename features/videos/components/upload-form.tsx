"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UploadCloud, Film, Image as ImageIcon, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/features/storage/upload";
import { createVideo } from "@/features/videos/actions";
import { getYouTubeId } from "@/features/videos/components/video-player";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  visibility: z.enum(["public", "unlisted", "private"]),
  tags: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

/** Read a video file's duration in seconds, client-side. */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      resolve(Math.round(el.duration) || 0);
    };
    el.onerror = () => resolve(0);
    el.src = URL.createObjectURL(file);
  });
}

export function UploadForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [progress, setProgress] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { visibility: "public" },
  });

  function onSubmit(values: FormValues) {
    const ytUrl = youtubeUrl.trim();
    const ytId = ytUrl ? getYouTubeId(ytUrl) : null;

    if (ytUrl && !ytId) {
      toast.error("That doesn't look like a valid YouTube link.");
      return;
    }
    if (!ytId && !videoFile) {
      toast.error("Paste a YouTube link or choose a video file to upload.");
      return;
    }

    start(async () => {
      try {
        let videoUrl: string;
        let duration = 0;
        let thumbnailUrl = "";

        if (ytId) {
          // YouTube path — embed by URL, default the thumbnail to YouTube's.
          videoUrl = `https://www.youtube.com/watch?v=${ytId}`;
          thumbnailUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
        } else {
          setProgress("Reading video…");
          duration = await readDuration(videoFile!);
          setProgress("Uploading video…");
          videoUrl = (await uploadFile("videos", videoFile!)).url;
        }

        if (thumbFile) {
          setProgress("Uploading thumbnail…");
          thumbnailUrl = (await uploadFile("thumbnails", thumbFile)).url;
        }

        setProgress("Publishing…");
        const res = await createVideo({
          title: values.title,
          description: values.description ?? "",
          videoUrl,
          thumbnailUrl,
          duration,
          visibility: values.visibility,
          tags:
            values.tags
              ?.split(",")
              .map((t) => t.trim())
              .filter(Boolean) ?? [],
        });

        if (!res.ok || !res.data) {
          toast.error(res.error ?? "Upload failed");
          setProgress("");
          return;
        }
        toast.success("Video published!");
        router.push(`/watch/${res.data.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        setProgress("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">YouTube link</Label>
        <div className="flex items-center gap-2">
          <Link2 className="size-4 shrink-0 text-muted-foreground" />
          <Input
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a YouTube link to embed it — or upload your own file below.
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR UPLOAD A FILE
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilePicker
          label="Video file"
          icon={Film}
          accept="video/*"
          file={videoFile}
          onChange={setVideoFile}
          hint="MP4, WebM or MOV — up to 500MB"
        />
        <FilePicker
          label="Thumbnail (optional)"
          icon={ImageIcon}
          accept="image/*"
          file={thumbFile}
          onChange={setThumbFile}
          hint="JPG, PNG or WebP — 16:9 recommended"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="An awesome title" />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          {...register("description")}
          placeholder="Tell viewers about your video"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            {...register("visibility")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" {...register("tags")} placeholder="coding, react, web" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          {pending ? "Working…" : "Publish video"}
        </Button>
        {progress && (
          <span className="text-sm text-muted-foreground">{progress}</span>
        )}
      </div>
    </form>
  );
}

function FilePicker({
  label,
  icon: Icon,
  accept,
  file,
  onChange,
  hint,
}: {
  label: string;
  icon: React.ElementType;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-foreground/40">
      <Icon className="size-7 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        {file ? file.name : hint}
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
