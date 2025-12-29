import ResidualsClient from "./ResidualsClient";

export default function ResidualsPage({
  params,
}: {
  params: { region: string };
}) {
  return <ResidualsClient region={params.region} />;
}
