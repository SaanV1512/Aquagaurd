"use client";

import { useEffect, useState } from "react";

interface Props {
  region: string;
}

export default function TimeSeriesClient({ region }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!region) return; // safety

    setLoading(true);
    fetch(`http://127.0.0.1:8000/timeseries/${region}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [region]);

  if (loading) return <p className="text-white p-8">Loading...</p>;
  if (error) return <p className="text-red-500 p-8">Error: {error}</p>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-xl font-bold">TimeSeries — {region}</h1>
      <pre className="mt-4 rounded bg-black/40 p-4 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
