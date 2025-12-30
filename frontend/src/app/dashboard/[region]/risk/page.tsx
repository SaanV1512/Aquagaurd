import RiskClient from "./RiskClient";

interface Props {
  params: Promise<{ region: string }>;
}

export default async function RiskPage({ params }: Props) {
  const { region } = await params; // ✅ unwrap the promise

  return <RiskClient region={region} />;
}
