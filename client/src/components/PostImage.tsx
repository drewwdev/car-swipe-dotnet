import { useState } from "react";

type Props =
  | { src?: string; urls?: never; className?: string; alt?: string }
  | { urls?: string[]; src?: never; className?: string; alt?: string };

const FALLBACK = "https://placehold.co/1200x600/cccccc/757575?text=No+Image";

export default function PostImage(props: Props) {
  const initial =
    "src" in props
      ? props.src || FALLBACK
      : props.urls && props.urls.length > 0 && props.urls[0]
      ? props.urls[0]
      : FALLBACK;

  const [src, setSrc] = useState(initial);

  return (
    <img
      src={src}
      alt={("alt" in props && props.alt) || "Car"}
      className={props.className}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onError={(e) => {
        if (src !== FALLBACK) setSrc(FALLBACK);
      }}
    />
  );
}
