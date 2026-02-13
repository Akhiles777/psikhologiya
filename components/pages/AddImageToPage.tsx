"use client";


import ImageUploadField from "./ImageUploadField";
import { useState } from "react";

interface Props {
  initialImages?: string[];
}

export default function AddImageToPage({ initialImages = [] }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [lastUrl, setLastUrl] = useState("");

  const handleUploaded = (url: string) => {
    setImages(prev => [...prev, url]);
    setLastUrl(url);
  };

  const handleRemove = (url: string) => {
    setImages(prev => prev.filter(img => img !== url));
  };

  return (
    <div className="my-4">
      <ImageUploadField onUploaded={handleUploaded} />
      {images.length > 0 && (
        <div className="mt-2 space-y-2">
          <label className="block text-sm font-medium text-green-700 mb-1">
            Список изображений для страницы:
          </label>
          {images.map((url, idx) => (
            <div key={url} className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent border border-green-300 rounded px-2 py-1 text-green-800 font-mono text-xs"
                onFocus={e => e.target.select()}
              />
              <button
                type="button"
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleRemove(url)}
              >
                Удалить
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => navigator.clipboard.writeText(url)}
              >
                Копировать
              </button>
              {/* Hidden input for form submission */}
              <input type="hidden" name="images" value={url} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
