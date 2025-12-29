import Link from "next/link";

export default function RegionHome({
  params,
}: {
  params: { region: string };
}) {
  const { region } = params;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Region: {region}</h1>

      <div className="mt-6 space-y-3">
        <Link href={`/dashboard/${region}/timeseries`} className="block text-cyan-400 hover:underline">
          Actual vs Predicted
        </Link>

        <Link href={`/dashboard/${region}/residuals`} className="block text-cyan-400 hover:underline">
          Residuals Over Time
        </Link>

        <Link href={`/dashboard/${region}/risk`} className="block text-cyan-400 hover:underline">
          Risk Score Over Time
        </Link>
      </div>
    </div>
  );
}
