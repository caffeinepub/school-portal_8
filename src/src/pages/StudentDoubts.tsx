import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doubts } from "@/data/mockData";
import { CheckCircle, Clock, MessageSquare, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function StudentDoubts() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <PlusCircle size={16} /> Ask a Doubt
        </Button>
      </div>

      {doubts.map((d) => (
        <div
          key={d.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`mt-0.5 flex-shrink-0 ${
                d.answered ? "text-green-500" : "text-orange-400"
              }`}
            >
              {d.answered ? <CheckCircle size={18} /> : <Clock size={18} />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 mb-1">{d.question}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {d.subject}
                </span>
                <span className="text-xs text-gray-400">{d.date}</span>
              </div>
            </div>
          </div>
          {d.answered && (
            <div className="ml-7 bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-xs font-medium text-green-700 mb-1">
                {d.answeredBy} replied:
              </p>
              <p className="text-sm text-gray-700">{d.answer}</p>
            </div>
          )}
          {!d.answered && (
            <div className="ml-7 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} /> Awaiting teacher response...
              </p>
            </div>
          )}
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a Doubt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Subject</Label>
              <Input placeholder="e.g. Mathematics" className="mt-1" />
            </div>
            <div>
              <Label>Your Question</Label>
              <textarea
                className="w-full mt-1 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your doubt in detail..."
              />
            </div>
            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Doubt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
