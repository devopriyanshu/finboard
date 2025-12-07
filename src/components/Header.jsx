import { Plus } from "lucide-react";

export default function Header({ onAdd }) {
  return (
    <header className="w-full px-6 py-4 bg-[#0f172a] flex justify-between items-center border-b border-slate-800">
      <div>
        <h1 className="text-xl font-semibold text-white">Finance Dashboard</h1>
        <p className="text-sm text-slate-400">
          1 active widget • Real-time data
        </p>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
      >
        <Plus size={18} />
        Add Widget
      </button>
    </header>
  );
}
