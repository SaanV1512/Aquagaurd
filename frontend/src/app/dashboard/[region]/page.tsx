import Link from "next/link";

interface Props {
  params: Promise<{ region: string }>;
}

export default async function RegionHome({ params }: Props) {
  const { region } = await params; // ✅ THIS is the fix

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Region: {region}</h1>

      <div className="mt-6 space-y-3">
        <Link href={`/dashboard/${region}/timeseries`} className="block text-cyan-400">
          Timeseries
        </Link>

        <Link href={`/dashboard/${region}/risk`} className="block text-cyan-400">
          Risk Score
        </Link>
      </div>
    </div>
  );
}
