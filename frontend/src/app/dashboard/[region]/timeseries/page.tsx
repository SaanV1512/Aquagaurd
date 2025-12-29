import TimeSeriesClient from "./TimeSeriesClient";

export default function TimeSeriesPage({
  params,
}: {
  params: { region: string };
}) {
  return <TimeSeriesClient region={params.region} />;
}
