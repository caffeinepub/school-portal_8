import { getMediaBlobUrl } from "@/utils/mediaStorage";
import { Film, Image as ImageIcon, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MediaItem {
  id: string;
  blobReferenceId: string;
  url: string;
  fileType: "photo" | "video";
  caption: string;
  uploadedAt: string;
}

const DEMO_STUDENT_ID = 1;

export default function StudentMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const loadedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`lords_media_${DEMO_STUDENT_ID}`);
      if (raw) setMedia(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const idsToLoad = media
      .map((item) => item.id)
      .filter((id) => !loadedIds.current.has(id));
    if (idsToLoad.length === 0) return;
    for (const id of idsToLoad) loadedIds.current.add(id);
    const load = async () => {
      for (const id of idsToLoad) {
        const url = await getMediaBlobUrl(id);
        if (url && !cancelled) {
          setBlobUrls((prev) => ({ ...prev, [id]: url }));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [media]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Film size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            My Photos & Videos
          </h2>
          <p className="text-sm text-gray-500">Uploaded by your teacher</p>
        </div>
      </div>

      {media.length === 0 ? (
        <div
          data-ocid="student_media.empty_state"
          className="bg-white rounded-xl border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-base mb-1">
            No media yet
          </h3>
          <p className="text-gray-400 text-sm max-w-xs">
            No photos or videos yet. Your teacher will upload media for you
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`student_media.item.${idx + 1}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="relative bg-gray-100 aspect-video">
                {blobUrls[item.id] ? (
                  item.fileType === "photo" ? (
                    <img
                      src={blobUrls[item.id]}
                      alt={item.caption || "Photo"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={blobUrls[item.id]}
                      controls
                      className="w-full h-full object-contain"
                    >
                      <track kind="captions" />
                    </video>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.fileType === "photo"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.fileType === "photo" ? (
                      <ImageIcon size={11} />
                    ) : (
                      <PlayCircle size={11} />
                    )}
                    {item.fileType === "photo" ? "Photo" : "Video"}
                  </span>
                </div>
              </div>
              {item.caption && (
                <div className="px-3 py-2.5">
                  <p className="text-sm text-gray-700 font-medium">
                    {item.caption}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.uploadedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
