import * as React from "react";

import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";

import "yet-another-react-lightbox/plugins/counter.css";

import { LightboxButton, Paragraph, Title } from "@/components";
// import slides from "@/data/slides";
import ladies from "@/data/ladies01";

export default function CounterPluginMyWork() {
  const [open, setOpen] = React.useState(false);
  console.log(ladies);

  return (
    <>
      <Title>Counter Plugin - My Work</Title>

      <Paragraph>Counter plugin adds slides counter to the lightbox. 
        Using it to show slides of stunning models and ladies.</Paragraph>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={ladies}
        plugins={[Counter]}
      />

      <LightboxButton onClick={() => setOpen(true)} />
    </>
  );
}
