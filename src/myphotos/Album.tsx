import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import type { SlideshowRef } from "yet-another-react-lightbox";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";

import "yet-another-react-lightbox/plugins/counter.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { Paragraph, Title } from "@/components";
// import slides from "@/data/slides.ts";
// import aodais from "@/data/aodaivietnam01";

// Cache the resolved album cover URL per album path so it renders instantly on
// revisit. The album data itself is still refetched in the background.
const COVER_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function readCachedCover(path: string): string {
  try {
    const raw = localStorage.getItem("albumCover:" + path);
    if (!raw) return "";
    const { src, ts } = JSON.parse(raw) as { src: string; ts: number };
    if (!src || Date.now() - ts > COVER_CACHE_TTL) return "";
    return src;
  } catch {
    return "";
  }
}

function writeCachedCover(path: string, src: string) {
  try {
    localStorage.setItem(
      "albumCover:" + path,
      JSON.stringify({ src, ts: Date.now() })
    );
  } catch {
    /* ignore quota / unavailable storage */
  }
}

// Mirrors the {cover_photo_id, cover_photo_url, needs_regen} shape shared by
// every /api/v1/album/<path>/cover response on the backend.
type CoverResource = {
  cover_photo_id: string | null;
  cover_photo_url: string | null;
  needs_regen: boolean;
};

export default function Album() {
  const pathname = window.location.pathname;
  const path = pathname.substring(pathname.lastIndexOf("/") + 1);

  const [open, setOpen] = React.useState(false);
  const [cover, setCover] = React.useState(() => readCachedCover(path));
  const [coverIndex, setCoverIndex] = React.useState(0);
  const [coverState, setCoverState] = React.useState<CoverResource | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState("");
  const [startIndex, setStartIndex] = React.useState(0);

  const openAt = (index: number) => {
    setStartIndex(index);
    setOpen(true);
  };
  const [slides, setSlides] = React.useState([{
    src: "/aaaa/default.jpg"
  }]);
  const [album, setAlbum] = React.useState({
    _id: {},
    title: "No title",
    path: "/path",
    description: "No description",
    photos: [],
    photos_details: []
  });
  const slideshowRef = useRef<SlideshowRef>(null);
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_API+'/albums/' + path);
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log("Slides:", slides);
    }
  }, [path]);

  const fetchCoverState = useCallback(async (): Promise<CoverResource | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/v1/album/${path}/cover`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching cover state:', error);
      return null;
    }
  }, [path]);

  // Loads the album's photos plus its cover state, and resolves what to
  // show as the cover image. Used on mount and again after a successful
  // generate/re-generate so the new cover shows up immediately.
  const loadAlbum = useCallback(async () => {
    const [res, coverRes] = await Promise.all([fetchData(), fetchCoverState()]);
    if (!res) return;
    setAlbum(res);
    document.title = `${res.title} | Photo Manager`;
    const photos: React.SetStateAction<{ src: string; }[]> = [];
    res.photos_details.map((p: { [x: string]: string; }) => {
        photos.push({ "src": import.meta.env.VITE_BACKEND_API+"/photo/" + p['folder'] + "/" + p['filename'] });
    });
    setSlides(photos);
    setCoverState(coverRes);

    // Album cover: prefer the dedicated cover resource (freshest, and the
    // only place needs_regen comes from), then the /albums/<path> payload's
    // own cover_photo_url, since the cover photo isn't necessarily one of
    // the album's own photos (e.g. an auto-generated collage cover lives as
    // a standalone photo). Fall back to the first photo when neither has one.
    const coverId = coverRes?.cover_photo_id ?? res.cover_photo?.$oid;
    const details: { _id?: { $oid?: string } }[] = res.photos_details ?? [];
    const idx = coverId
      ? details.findIndex((p) => p?._id?.$oid === coverId)
      : -1;
    const resolvedIndex = idx >= 0 ? idx : 0;
    const coverSrc = coverRes?.cover_photo_url
      ? import.meta.env.VITE_BACKEND_API + coverRes.cover_photo_url
      : res.cover_photo_url
      ? import.meta.env.VITE_BACKEND_API + res.cover_photo_url
      : photos[resolvedIndex]?.src;
    if (coverSrc) {
      setCover(coverSrc);
      setCoverIndex(idx >= 0 ? idx : 0);
      writeCachedCover(path, coverSrc);
    }
  }, [fetchData, fetchCoverState, path]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'P') {
        if (slideshowRef.current?.playing) {
          slideshowRef.current.pause();
        } else {
          slideshowRef.current?.play();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const handleGenerateCover = async () => {
    if (coverState && !coverState.needs_regen) {
      if (!window.confirm("Replace the current cover with a newly generated one?")) {
        return;
      }
    }
    setGenerating(true);
    setGenerateError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/v1/album/${path}/cover/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ randomize: true }),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to generate cover");
      }
      await loadAlbum();
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Failed to generate cover");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Title>Album: {album.title}</Title>
      <Paragraph variant="h2"><em>{album.description}</em></Paragraph>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={startIndex}
        slides={slides}
        plugins={[Counter, Slideshow]}
        slideshow={{ ref: slideshowRef, autoplay: true, delay: 5000 }}
      />

      {cover && (
        <img
          src={cover}
          alt={`${album.title} cover`}
          onClick={() => openAt(coverIndex)}
          style={{
            display: "block",
            margin: "0 auto 16px",
            maxWidth: "100%",
            maxHeight: "70vh",
            cursor: "pointer",
          }}
        />
      )}

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {album.photos_details.length > 0 && (
          <Button
            variant="outlined"
            onClick={handleGenerateCover}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={16} /> : undefined}
          >
            {generating
              ? "Generating…"
              : coverState && !coverState.needs_regen
              ? "Re-generate cover"
              : "Generate cover"}
          </Button>
        )}

        <Button variant="contained" onClick={() => openAt(0)}>
          Open Lightbox
        </Button>
      </Box>

      {generateError && (
        <Typography color="error" variant="body2" sx={{ mt: -1, mb: 2 }}>
          {generateError}
        </Typography>
      )}

    </>
  );
}
