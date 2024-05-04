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

export const encodeCells = (cells: boolean[][]): string => {
  // Flatten the 2D array and convert boolean values to bits
  let bitString = cells
    .flat()
    .map((val) => (val ? "1" : "0"))
    .join("");

  // Pad the bit string to make its length a multiple of 6
  while (bitString.length % 6 !== 0) {
    bitString += "0"; // pad with zeros at the end if necessary
  }

  // Convert bit string to Base64
  const binaryString = bitString
    .match(/.{1,6}/g)
    ?.map((bits) => parseInt(bits, 2));
  if (!binaryString) {
    return ''
  }
  return btoa(String.fromCharCode.apply(null, binaryString));
}

export const decodeCells = (
  encoded: string,
  rows: number,
  cols: number
): boolean[][] => {

  while (encoded.length % 4 != 0) {
    encoded += '='
  }

  const buffer = Buffer.from(encoded, "base64");
  const bytes = new Uint8Array(buffer)

  // Convert buffer to boolean array
  const boolArray: boolean[] = new Array(rows*cols).fill(false);
  let pos = 0
  bytes.forEach(byte => {
    // Process each byte to get 8 boolean values
    for (let j = 7; j >= 0; j--) {
      boolArray[pos++] = (byte & (1 << j)) !== 0;
    }
  })

  // Check if the dimensions match the desired output
  const result: boolean[][] = [];
  for (let i = 0; i < rows; i++) {
    const start = i * cols;
    const row = boolArray.slice(start, start + cols);
    result.push(row);
  }
  return result;
};

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
    count: 0,
    color: {
      red: 40,
      green: 220,
      blue: 220
    }
  }
});