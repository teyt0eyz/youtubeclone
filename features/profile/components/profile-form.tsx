"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/features/storage/upload";
import { updateProfile } from "@/features/profile/actions";
import type { Profile } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url ?? "");

  async function onPickAvatar(file: File) {
    try {
      const { url } = await uploadFile("avatars", file);
      setAvatarUrl(url);
      toast.success("Avatar uploaded — save to apply");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function onPickBanner(file: File) {
    try {
      const { url } = await uploadFile("banners", file);
      setBannerUrl(url);
      toast.success("Banner uploaded — save to apply");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfile({
        displayName,
        username,
        bio,
        avatarUrl,
        bannerUrl,
      });
      if (res.ok) {
        toast.success("Profile updated");
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} alt={username} size={72} />
        <label className="cursor-pointer">
          <span className="text-sm font-medium text-primary hover:underline">
            Change avatar
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && onPickAvatar(e.target.files[0])
            }
          />
        </label>
        <label className="cursor-pointer">
          <span className="text-sm font-medium text-primary hover:underline">
            Change banner
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && onPickBanner(e.target.files[0])
            }
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers and underscores only.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
