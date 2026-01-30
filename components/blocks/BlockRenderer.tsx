import { BlockCatalogPreview } from "./BlockCatalogPreview";
import { BlockFeatures } from "./BlockFeatures";
import { BlockHero } from "./BlockHero";
import type { PageBlock } from "@/types/blocks";

export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "Hero") {
          return <BlockHero key={i} block={block} />;
        }
        if (block.type === "Features") {
          return <BlockFeatures key={i} block={block} />;
        }
        if (block.type === "CatalogPreview") {
          return <BlockCatalogPreview key={i} block={block} />;
        }
        return null;
      })}
    </>
  );
}
