"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File, userId: string) => {
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const filePath = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
}
