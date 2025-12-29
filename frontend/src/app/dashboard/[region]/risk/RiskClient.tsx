"use client";

import { useEffect, useState } from "react";

export default function RiskClient({ region }: { region: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/risk/${region}`)
      .then(res => res.json())
      .then(setData);
  }, [region]);

  return (
    <div className="p-8 text-white">
      <h1 className="text-xl font-bold">Risk Score — {region}</h1>

      <pre className="mt-4 rounded bg-black/40 p-4">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
