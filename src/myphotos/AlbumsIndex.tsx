import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Link, Title } from "@/components";

export type AlbumSummary = {
  path: string;
  title: string;
  description?: string;
  cover_photo_url?: string | null;
};

type AlbumsIndexProps = {
  albums: AlbumSummary[];
  loading: boolean;
};

// Plain camera glyph, drawn inline so albums with no cover yet don't need an
// extra icon-font/package dependency just for a placeholder.
function CoverPlaceholder() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2f7 0%, #dde5ee 100%)",
        color: "rgba(0, 0, 0, 0.22)",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M21 16l-5.5-5.5L11 15l-2-2L3 18" strokeLinejoin="round" />
      </svg>
    </Box>
  );
}

function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgb(229, 234, 242)",
        transition: "box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease",
        "&:hover": {
          borderColor: "rgb(153, 204, 255)",
          boxShadow: "0 8px 20px rgba(31, 61, 97, 0.14)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea component={Link} href={`/myphotos/${album.path}`} sx={{ alignItems: "stretch" }}>
        <Box sx={{ aspectRatio: "4 / 3", overflow: "hidden" }}>
          {album.cover_photo_url ? (
            <Box
              component="img"
              src={`${import.meta.env.VITE_BACKEND_API}${album.cover_photo_url}`}
              alt={album.title}
              loading="lazy"
              decoding="async"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <CoverPlaceholder />
          )}
        </Box>
        <CardContent sx={{ textAlign: "left", width: "100%" }}>
          <Typography
            variant="subtitle1"
            component="h3"
            fontWeight={600}
            title={album.title}
            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {album.title}
          </Typography>
          {album.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              title={album.description}
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {album.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function AlbumCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 3", width: "100%" }} />
      <Skeleton width="70%" sx={{ mt: 1 }} />
      <Skeleton width="90%" />
    </Box>
  );
}

export default function AlbumsIndex({ albums, loading }: AlbumsIndexProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return albums;
    return albums.filter((album) => album.title.toLowerCase().includes(q));
  }, [albums, query]);

  return (
    <Box sx={{ my: 3, textAlign: "left" }}>
      <Title sx={{ textAlign: "center" }}>My Photos</Title>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Search albums…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <Typography variant="body2" color="text.secondary">
          {loading
            ? "Loading albums…"
            : query
            ? `${filtered.length} of ${albums.length} albums`
            : `${albums.length} album${albums.length === 1 ? "" : "s"}`}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 3,
        }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <AlbumCardSkeleton key={i} />)
          : filtered.map((album) => <AlbumCard key={album.path} album={album} />)}
      </Box>

      {!loading && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
          No albums match "{query}".
        </Typography>
      )}
    </Box>
  );
}
