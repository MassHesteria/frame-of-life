import { farcasterHubContext } from "frames.js/middleware";
import { createFrames } from "frames.js/next";
import { headers } from "next/headers";

//-------------------------------------------------------------------
// Utility functions
//-------------------------------------------------------------------

export const getHostName = (): string => {
  if (process.env['HOST']) {
    return process.env['HOST']
  }
  const headersList = headers();
  const host = headersList.get('x-forwarded-host');
  const proto = headersList.get('x-forwarded-proto');
  return `${proto}://${host}`;
}

const getHubRoute = (): string => {
  if (process.env['VERCEL_REGION']) {
    return 'https://nemes.farcaster.xyz:2281'
  }
  return 'http://localhost:3010/hub'
}

//-------------------------------------------------------------------
// Frame setup
//-------------------------------------------------------------------

export type Color = {
  red: number;
  green: number;
  blue: number;
}

export type State = {
  cells: boolean[][];
  count: number;
  color: Color;
}
 
export const frames = createFrames<State>({
  middleware: [farcasterHubContext({
    hubHttpUrl: getHubRoute()
  })],
  initialState: {
    cells: [],
    count: 100,
    color: {
      red: 40,
      green: 220,
      blue: 220
    }
  }
});