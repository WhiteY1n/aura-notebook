"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, Pause, RotateCcw, Volume2, Download, MoreVertical, Trash2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  notebookId?: string;
  expiresAt?: string | null;
  onError?: () => void;
  onDeleted?: () => void;
  onRetry?: () => void;
  onUrlRefresh?: (notebookId: string) => void;
}

export function AudioPlayer({
  audioUrl,
  title = "Deep Dive Conversation",
  notebookId,
  expiresAt,
  onError,
  onDeleted,
  onRetry,
  onUrlRefresh,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryInProgress, setAutoRetryInProgress] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const isExpired = expiresAt ? new Date(expiresAt) <= new Date() : false;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setLoading(false);
      setAudioError(null);
      setRetryCount(0);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = async (e: Event) => {
      console.error("Audio error:", e);
      setLoading(false);
      setIsPlaying(false);

      if ((isExpired || audioError?.includes("403") || audioError?.includes("expired")) && notebookId && onUrlRefresh && retryCount < 2 && !autoRetryInProgress) {
        console.log("Audio URL expired or access denied, attempting automatic refresh...");
        setAutoRetryInProgress(true);
        setRetryCount((prev) => prev + 1);
        onUrlRefresh(notebookId);
        return;
      }

      if (retryCount < 2 && !autoRetryInProgress) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          audio.load();
        }, 1000 * (retryCount + 1));
      } else {
        setAudioError("Failed to load audio");
        setAutoRetryInProgress(false);
        onError?.();
      }
    };

    const handleCanPlay = () => {
      setLoading(false);
      setAudioError(null);
      setRetryCount(0);
      setAutoRetryInProgress(false);
    };

    const handleLoadStart = () => {
      if (autoRetryInProgress) {
        setLoading(true);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onError, isExpired, retryCount, notebookId, onUrlRefresh, audioError, autoRetryInProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && autoRetryInProgress) {
      console.log("Reloading audio with new URL...");
      audio.load();
    }
  }, [audioUrl, autoRetryInProgress]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Play failed:", error);
          setAudioError("Playback failed");
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    const time = value[0];
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = value[0];
    audio.volume = vol;
    setVolume(vol);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const retryLoad = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);
    setAudioError(null);
    setRetryCount(0);
    setAutoRetryInProgress(false);
    audio.load();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const downloadAudio = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch audio file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "audio"}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: "Download started", description: "Your audio file is downloading." });
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: "Download failed", description: "Unable to download audio.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteAudio = async () => {
    if (!notebookId) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.functions.invoke("delete-audio-overview", {
        body: { notebookId },
      });

      if (error) {
        throw error;
      }

      toast({ title: "Audio deleted", description: "The audio overview has been removed." });
      onDeleted?.();
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Delete failed", description: "Unable to delete audio.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const actionDisabled = loading || !!audioError;

  return (
    <Card className="p-3 border border-border relative">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="font-semibold text-foreground text-sm">{title}</h4>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              URL expires at {new Date(expiresAt).toLocaleString()}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={downloadAudio} disabled={isDownloading || actionDisabled}>
              <Download className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={retryLoad} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteAudio} disabled={isDeleting} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="secondary" className="h-10 w-10" onClick={togglePlayPause} disabled={actionDisabled}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <div className="flex-1 space-y-2">
            <Slider value={[currentTime]} max={duration || 1} step={0.1} onValueChange={handleSeek} disabled={actionDisabled} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-[140px]">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon-sm" variant="ghost" onClick={restart} disabled={actionDisabled}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={retryLoad} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reload
            </Button>
          </div>
        </div>

        {audioError && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{audioError}</span>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry} className="ml-auto">
                Retry generate
              </Button>
            )}
          </div>
        )}
      </div>

      <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />
    </Card>
  );
}
