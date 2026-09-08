import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import type { SlideshowRef } from "yet-another-react-lightbox";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";

import "yet-another-react-lightbox/plugins/counter.css";

import { LightboxButton, Paragraph, Title } from "@/components";
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

export default function Album() {
  const pathname = window.location.pathname;
  const path = pathname.substring(pathname.lastIndexOf("/") + 1);

  const [open, setOpen] = React.useState(false);
  const [cover, setCover] = React.useState(() => readCachedCover(path));
  const [coverIndex, setCoverIndex] = React.useState(0);
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
    fetchData().then((res) => {
      setAlbum(res);
      document.title = `${res.title} | Photo Manager`;
      // console.log(res.photos_details);
      // setSlides([{ "src": import.meta.env.BACKEND_SVR + "/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      // setSlides([{ "src": "http://127.0.0.1:5000/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      const photos: React.SetStateAction<{ src: string; }[]> = [];
      res.photos_details.map((p: { [x: string]: string; }) => {
          photos.push({ "src": import.meta.env.VITE_BACKEND_API+"/photo/" + p['folder'] + "/" + p['filename'] });
      });
      setSlides(photos);

      // Album cover: the photo referenced by album.cover_photo, falling back to
      // the first photo when no cover has been set on the album.
      const coverId = res.cover_photo?.$oid;
      const details: { _id?: { $oid?: string } }[] = res.photos_details ?? [];
      const idx = coverId
        ? details.findIndex((p) => p?._id?.$oid === coverId)
        : -1;
      const resolvedIndex = idx >= 0 ? idx : 0;
      if (photos.length > 0) {
        setCover(photos[resolvedIndex].src);
        setCoverIndex(resolvedIndex);
        writeCachedCover(path, photos[resolvedIndex].src);
      }
    });
  }, [fetchData, path]);

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

      <LightboxButton onClick={() => openAt(0)} />

    </>
  );
}
