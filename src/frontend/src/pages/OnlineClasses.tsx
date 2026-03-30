// @ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { onlineClasses } from "@/data/mockData";
import { Calendar, Play, User } from "lucide-react";
import { useState } from "react";

export default function OnlineClasses() {
  const [selected, setSelected] = useState<(typeof onlineClasses)[0] | null>(
    null,
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {onlineClasses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className={`${c.color} h-36 flex items-center justify-center`}>
              <Play size={40} className="text-white/80" />
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-600 font-medium mb-1">
                {c.subject}
              </p>
              <h4 className="font-semibold text-gray-800 mb-3">{c.title}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <User size={12} /> {c.teacher}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <Calendar size={12} /> {c.date}
              </div>
              <Button
                onClick={() => setSelected(c)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
              >
                <Play size={14} className="mr-2" /> Watch Class
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              title={selected?.title ?? "Online Class"}
              src={`https://www.youtube.com/embed/${selected?.youtubeId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-gray-500">
            {selected?.subject} &bull; {selected?.teacher}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
