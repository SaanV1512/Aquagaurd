import TimeSeriesClient from "./TimeSeriesClient";

interface Props {
  params: Promise<{ region: string }>;
}

export default async function TimeSeriesPage({ params }: Props) {
  const { region } = await params; // ✅ SAME FIX

  return <TimeSeriesClient region={region} />;
}
