import { fetchMetadata } from "frames.js/next";
import { getHostName } from "./frames";

export async function generateMetadata() {
  const routeUrl = new URL("/frames", getHostName())
  const metaData = await fetchMetadata(routeUrl);
  return {
    title: "Frame of Life",
    description: "Conway's Game of Life in a Frame",
    metadataBase: new URL(getHostName()),
    other: metaData,
  };
}

export default async function Page() {
  return (
    <div className="pl-2 pt-2">
      <div>Mic check</div>
    </div>
  )
}
