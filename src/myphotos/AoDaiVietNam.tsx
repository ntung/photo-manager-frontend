import * as React from "react";

import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";

import "yet-another-react-lightbox/plugins/counter.css";

import { LightboxButton, Paragraph, Title } from "@/components";
import aodais from "@/data/aodaivietnam01";

export default function AoDaiVietNam() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Title>The Sexiest Ao Dai Collection</Title>

      <Paragraph>Bo Suu Tap Ao Dai Viet Nam Sexiest.</Paragraph>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={aodais}
        plugins={[Counter]}
      />

      <LightboxButton onClick={() => setOpen(true)} />
    </>
  );
}
