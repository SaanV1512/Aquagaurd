"use client";

import { useEffect, useState } from "react";

export default function ResidualsClient({ region }: { region: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/timeseries/${region}`)
      .then(res => res.json())
      .then(setData);
  }, [region]);

  const residuals = data.map(d => ({
    date: d.date,
    residual: d.actual - d.predicted,
  }));

  return (
    <div className="p-8 text-white">
      <h1 className="text-xl font-bold">Residuals — {region}</h1>

      <pre className="mt-4 rounded bg-black/40 p-4">
        {JSON.stringify(residuals, null, 2)}
      </pre>
    </div>
  );
}
