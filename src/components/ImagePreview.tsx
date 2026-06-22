import type { ComponentProps } from "react";
import Lightbox, { type SlideImage, type SlotStyles } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Icon } from "./Icon";
import styles from "./ImagePreview.module.css";

const LIGHTBOX_STYLES = {
  root: {
    "--yarl__button_background_color": "rgb(42 42 42 / 0.72)",
    "--yarl__button_border": "1px solid rgb(255 255 255 / 0.42)",
    "--yarl__button_filter": "none",
    "--yarl__button_margin": "0 0.25rem",
    "--yarl__button_padding": "0",
    "--yarl__carousel_padding_px": 16,
    "--yarl__color_backdrop": "rgb(0 0 0 / 0.86)",
    "--yarl__icon_size": "1.05rem",
    "--yarl__navigation_button_padding": "0"
  },
  button: {
    alignItems: "center",
    backdropFilter: "blur(8px)",
    borderRadius: "999px",
    boxShadow: "0 10px 24px rgb(0 0 0 / 0.28), 0 0 0 1px rgb(0 0 0 / 0.25)",
    display: "inline-flex",
    height: "2.45rem",
    justifyContent: "center",
    minWidth: "2.45rem",
    transition: "background 0.16s ease, color 0.16s ease, opacity 0.16s ease, transform 0.16s ease"
  },
  slide: {
    padding: "1rem"
  },
  toolbar: {
    gap: "0.45rem",
    justifyContent: "center",
    left: "50%",
    padding: "1rem 0",
    right: "auto",
    transform: "translateX(-50%)"
  },
  navigationPrev: {
    height: "2.65rem",
    margin: "0 1rem",
    top: "50%",
    width: "2.65rem"
  },
  navigationNext: {
    height: "2.65rem",
    margin: "0 1rem",
    top: "50%",
    width: "2.65rem"
  }
} satisfies SlotStyles;

const LIGHTBOX_IMAGE_PROPS = {
  style: {
    background: "var(--blog-image-paper)",
    border: "1px solid var(--blog-image-paper-border)",
    borderRadius: "0.5rem",
    boxShadow: "0 24px 70px rgb(0 0 0 / 0.45)",
    padding: "0.5rem"
  }
} satisfies NonNullable<ComponentProps<typeof Lightbox>["carousel"]>["imageProps"];

export type ImagePreviewState = {
  index: number;
  slides: SlideImage[];
};

type ImagePreviewProps = {
  preview: ImagePreviewState | null;
  onClose: () => void;
};

export function ImagePreview({ preview, onClose }: ImagePreviewProps) {
  return (
    <Lightbox
      open={preview !== null}
      close={onClose}
      index={preview?.index ?? 0}
      slides={preview?.slides ?? []}
      plugins={[Zoom]}
      className={styles.root}
      styles={LIGHTBOX_STYLES}
      carousel={{ finite: true, imageFit: "contain", imageProps: LIGHTBOX_IMAGE_PROPS, padding: 16 }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true, closeOnPullUp: true }}
      animation={{ fade: 180, swipe: 220, zoom: 220 }}
      zoom={{
        maxZoomPixelRatio: 4,
        scrollToZoom: true,
        wheelZoomDistanceFactor: 140,
        zoomInMultiplier: 1.6
      }}
      labels={{
        Close: "Close image preview",
        Next: "Next image",
        Previous: "Previous image",
        "Zoom in": "Zoom in",
        "Zoom out": "Zoom out"
      }}
      render={{
        iconClose: () => <Icon name="close" />,
        iconNext: () => <Icon name="chevron-right" />,
        iconPrev: () => <Icon name="chevron-left" />,
        iconZoomIn: () => <Icon name="zoom-in" />,
        iconZoomOut: () => <Icon name="zoom-out" />
      }}
      toolbar={{ buttons: ["zoom", "close"] }}
    />
  );
}
