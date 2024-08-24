import * as React from "react";
import { useCallback, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";

import "yet-another-react-lightbox/plugins/counter.css";

import { LightboxButton, Paragraph, Title } from "@/components";
// import aodais from "@/data/aodaivietnam01";

export default function Album() {
  const [open, setOpen] = React.useState(false);
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
      const response = await fetch('http://localhost:5000/albums/' + path);
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log(slides);
    }
  }, [path]);

  useEffect(() => {
    fetchData().then((res) => {
      setAlbum(res);
      // console.log(res.photos_details);
      // setSlides([{ "src": import.meta.env.BACKEND_SVR + "/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      // setSlides([{ "src": "http://127.0.0.1:5000/photo/aaaa/451845670_122161434170133782_9141442333876530996_n.jpg" }]);
      const photos: React.SetStateAction<{ src: string; }[]> = [];
      res.photos_details.map((p: { [x: string]: string; }, idx: never) => {
          console.log(idx);
          photos.push({ "src": "http://127.0.0.1:5000/photo/" + p['folder'] + "/" + p['filename'] });
      });
      setSlides(photos);
    });
  }, [fetchData]);

  return (
    <>
      <Title>Album: {album.title}</Title>
      <Paragraph><h2><em>{album.description}</em></h2></Paragraph>
      <Paragraph>{pathname}</Paragraph>
      <ul>{
        album.photos.map((p, i) => (
          <li key={i}>{p}</li>
        ))
      }</ul>
      <h2>Photos Details</h2>
      <ul>
      {
        album.photos_details.map((p, i) => (
          <li key={i}>{import.meta.env.BACKEND_SVR}/photo/{p['folder']}/{p['filename']}</li>
        ))
      }
      </ul>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        plugins={[Counter]}
      />

      <LightboxButton onClick={() => setOpen(true)} />
    </>
  );
}
