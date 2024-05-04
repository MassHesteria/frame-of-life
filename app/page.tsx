import { fetchMetadata } from "frames.js/next";
import { getHostName } from "./frames";

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props) {
  const routeUrl = new URL("/frames", getHostName())

  for (let key in searchParams) {
    let value = searchParams[key];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(val => routeUrl.searchParams.append(key, val));
      } else {
        routeUrl.searchParams.append(key, value);
      }
    }
  }

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
