import * as React from "react";

import Lightbox from "yet-another-react-lightbox";

import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

import { Paragraph, Title } from "@/components";
import { useCallback, useEffect } from "react";

export default function Gallery() {
  const [index, setIndex] = React.useState(-1);
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
  const pathname = window.location.pathname;
  const path = pathname.substring(pathname.lastIndexOf("/")+1);
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_API+'/albums/' + path);
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log(slides);
    }
  }, [path, slides]);

  useEffect(() => {
    fetchData().then((res) => {
      setAlbum(res);
      // console.log(res.photos_details);
      // setSlides([{ "src": import.meta.env.BACKEND_SVR + "/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      // setSlides([{ "src": "http://127.0.0.1:5000/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      const photos: React.SetStateAction<{ src: string; width: number; height: number }[]> = [];
      res.photos_details.map((p: { [x: string]: string; }, idx: never) => {
        console.log(idx);
        photos.push({ "src": import.meta.env.VITE_BACKEND_API+"/photo/" + p['folder'] + "/" + p['filename'],
          width: 1000, height: 1200  });
      });
      setSlides(photos);
    });
  }, [fetchData]);

  return (
    <>
      <Title>Album: {album.title}</Title>
      <Paragraph><h2><em>{album.description}</em></h2></Paragraph>

      <RowsPhotoAlbum
        photos={slides}
        targetRowHeight={150}
        onClick={({ index: current }) => setIndex(current)}
      />

      <Lightbox
        index={index}
        slides={slides}
        open={index >= 0}
        close={() => setIndex(-1)}
      />
    </>
  );
}
