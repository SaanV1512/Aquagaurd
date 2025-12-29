import RiskClient from "./RiskClient";

export default function RiskPage({
  params,
}: {
  params: { region: string };
}) {
  return <RiskClient region={params.region} />;
}
