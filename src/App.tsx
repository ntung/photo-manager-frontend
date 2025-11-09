import * as React from "react";
import { useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import "yet-another-react-lightbox/styles.css";

import { Link, Section, Paragraph } from "@/components";
import sitemap from "@/data/sitemap";
import MyComponent from "@/myphotos/HelloWorld.tsx";

function Layout() {
  return (
    <Container maxWidth="lg" sx={{ textAlign: "center" }}>
      <Box component="header" sx={{ mt: 3, mb: 2 }}>
        <Link variant="h1" href="/">
          Yet Another React Lightbox
        </Link>
      </Box>

      <Divider sx={{ margin: "8px auto" }} />
      <MyComponent />
      <Divider sx={{ margin: "8px auto" }} />
      <Box component="main" sx={{ mb: 3 }}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </React.Suspense>
      </Box>
    </Container>
  );
}

export default function App() {
  const [albums, setAlbums] = useState([]);
  console.log("BACKEND_SVR", import.meta.env.BACKEND_SVR);
  console.log("VITE_SOME_KEY", import.meta.env.VITE_SOME_KEY);
  console.log("DB_PASSWORD", import.meta.env.DB_PASSWORD);
  console.log("MODE", import.meta.env.MODE);
  console.log("BASE_URL", import.meta.env.BASE_URL);

  console.log("TZ ", process.env.TZ);
  console.log("BACKEND SVR via process.env", process.env.REACT_APP_BACKEND_SVR);
  console.log(process.env.REACT_APP_DB_PASSWORD);
  useEffect(() => {
    fetchData().then((r) => {
      console.log(albums, r);
    });
  }, [albums]);

  const fetchData = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_API+'/albums');
      const result = await response.json();
      //console.log(result);
      setAlbums(result);
      result.forEach((album: { path: string; title: string; }) => {
        sitemap[2].children.push({
          path: album.path,
          title: album.title,
          Component: React.lazy(() => import("@/myphotos/Album"))
        });
      });
      return result;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <>
                {sitemap.map(({ path, title, children }) => (
                  <Section
                    key={path}
                    title={title}
                    path={path}
                    items={children}
                  />
                ))}

                <Typography variant="h2" color="primary">
                  Sandbox
                </Typography>

                <Paragraph mt={2}>
                  Are you looking for a sandbox to provide an example or
                  reproduce an issue? Here is a{" "}
                  <a
                    href="https://stackblitz.com/edit/yet-another-react-lightbox-sandbox?file=src%2FApp.tsx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    minimal sandbox
                  </a>
                  .
                </Paragraph>
              </>
            }
          />

          {sitemap.map(({ path, title, children }) => (
            <Route key={path} path={path}>
              <Route
                index
                element={<Section title={title} path={path} items={children} />}
              />

              {children.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
