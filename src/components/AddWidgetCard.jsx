import { Plus } from "lucide-react";

export default function AddWidgetCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-80 h-40 border border-slate-600 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/40 cursor-pointer transition"
    >
      <Plus size={26} />
      <p className="mt-2 font-medium">Add Widget</p>
      <p className="text-xs text-slate-500">Connect to a finance API</p>
    </div>
  );
}
