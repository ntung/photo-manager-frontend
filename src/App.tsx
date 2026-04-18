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

const AlbumComponent = React.lazy(() => import("@/myphotos/Album"));

export default function App() {
  const [albums, setAlbums] = useState<{ path: string; title: string }[]>([]);
  const [albumsLoaded, setAlbumsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_API + '/albums');
        const raw = await response.json();
        const result = raw.filter(
          (album: { path: string }, i: number, arr: { path: string }[]) =>
            arr.findIndex((a) => a.path === album.path) === i
        );
        setAlbums(result);
        const staticChildren = sitemap[2].children.filter(
          (c) => !result.some((album: { path: string }) => album.path === c.path)
        );
        sitemap[2].children = [
          ...staticChildren,
          ...result.map((album: { path: string; title: string }) => ({
            path: album.path,
            title: album.title,
            Component: AlbumComponent,
          })),
        ];
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setAlbumsLoaded(true);
      }
    };
    fetchData();
  }, []);

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

          {sitemap.slice(0, 2).map(({ path, title, children }) => (
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

          <Route path={sitemap[2].path}>
            <Route
              index
              element={<Section title={sitemap[2].title} path={sitemap[2].path} items={sitemap[2].children} />}
            />
            {!albumsLoaded
              ? <Route path="*" element={<div>Loading...</div>} />
              : albums.map(({ path }) => (
                  <Route key={path} path={path} element={<AlbumComponent />} />
                ))
            }
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
