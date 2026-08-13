import { createFileRoute } from "@tanstack/react-router";
import DuckEscape from "@/components/DuckEscape";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Duck Escape — Retro Arcade Duck Runner" },
      {
        name: "description",
        content:
          "Duck Escape is a retro arcade game: dodge tractors, dogs and the farmer, grab bread and run as far from the farm as you can.",
      },
      { property: "og:title", content: "Duck Escape — Retro Arcade Duck Runner" },
      {
        property: "og:description",
        content: "The farm wants you back. RUN. Play the pixel-art duck escape arcade game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <DuckEscape />;
}
