import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeWidget } from "@/store/widgetSlice";

export default function WidgetWrapper({ widget, children }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(widget.apiConfig.url);
        if (!res.ok) throw new Error("API Limit or Network Error");
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Real-time interval setup
    const intervalId = setInterval(
      fetchData,
      (widget.apiConfig.interval || 30) * 1000
    );

    return () => clearInterval(intervalId);
  }, [widget.apiConfig]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 h-full flex flex-col relative transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        <h3 className="font-bold text-slate-800 dark:text-white">
          {widget.name}
        </h3>
        <button
          onClick={() => dispatch(removeWidget(widget.id))}
          className="text-slate-400 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto min-h-[150px]">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">
            Error: {error}
          </div>
        )}
        {!loading && !error && data && children(data)}
      </div>
    </div>
  );
}
