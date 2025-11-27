import { 
  FileText, 
  FileImage, 
  FileAudio, 
  FileVideo, 
  File,
  Link,
  Youtube,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FileType = "pdf" | "doc" | "text" | "image" | "audio" | "video" | "youtube" | "website" | "unknown";

interface FileIconMapperProps {
  type: FileType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const iconColors = {
  pdf: "text-red-500",
  doc: "text-blue-500",
  text: "text-muted-foreground",
  image: "text-purple-500",
  audio: "text-orange-500",
  video: "text-pink-500",
  youtube: "text-red-600",
  website: "text-accent",
  unknown: "text-muted-foreground",
};

export function FileIconMapper({ type, className, size = "md" }: FileIconMapperProps) {
  const sizeClass = sizeClasses[size];
  const colorClass = iconColors[type];
  
  const iconMap = {
    pdf: FileText,
    doc: FileText,
    text: FileText,
    image: FileImage,
    audio: FileAudio,
    video: FileVideo,
    youtube: Youtube,
    website: Globe,
    unknown: File,
  };
  
  const Icon = iconMap[type] || File;
  
  return <Icon className={cn(sizeClass, colorClass, className)} />;
}

export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  
  const typeMap: Record<string, FileType> = {
    pdf: "pdf",
    doc: "doc",
    docx: "doc",
    txt: "text",
    md: "text",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    mp3: "audio",
    wav: "audio",
    m4a: "audio",
    ogg: "audio",
    mp4: "video",
    webm: "video",
    mov: "video",
  };
  
  return typeMap[ext || ""] || "unknown";
}

export function getFileTypeFromUrl(url: string): FileType {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return "website";
  }
  return getFileType(url);
}
