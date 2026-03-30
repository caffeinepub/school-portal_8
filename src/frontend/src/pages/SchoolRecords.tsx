// @ts-nocheck
import { Button } from "@/components/ui/button";
import { schoolRecords } from "@/data/mockData";
import { Download, FileText } from "lucide-react";

export default function SchoolRecords() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Academic Records</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Official documents for each academic year
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {schoolRecords.map((r) => (
          <div key={r.year} className="px-6 py-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{r.year}</p>
                <p className="text-xs text-gray-400">Class {r.class}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 ml-12">
              {r.reportCard && (
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Download size={12} /> Report Card
                </Button>
              )}
              {r.character && (
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Download size={12} /> Character Certificate
                </Button>
              )}
              {r.transfer && (
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Download size={12} /> Transfer Certificate
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
