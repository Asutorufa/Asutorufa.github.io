import { useEffect, useState } from "react";
import { ImagePreview, type ImagePreviewState } from "./ImagePreview";

export function ImagePreviewHost() {
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);

  useEffect(() => {
    const openImagePreview = (event: WindowEventMap["asutorufa-image-preview"]) => {
      setPreview(event.detail);
    };

    window.addEventListener("asutorufa-image-preview", openImagePreview);
    return () => window.removeEventListener("asutorufa-image-preview", openImagePreview);
  }, []);

  return <ImagePreview preview={preview} onClose={() => setPreview(null)} />;
}
