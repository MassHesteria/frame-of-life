import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp'
const GIFEncoder = require('gifencoder')

const GIF_from_Frames = (
   width: number,
   height: number,
   frames: any
) => {
  const encoder = new GIFEncoder(width, height);

  encoder.start();
  encoder.setRepeat(0); // 0 for infinite loop
  encoder.setDelay(1000); // Frame delay in ms

  // Add each buffer as a frame
  frames.forEach((f: any) => {
    encoder.addFrame(f);
  });

  encoder.finish();

  return encoder.out.getData();
};

type Pixel = {
  x: number;
  y: number;
}

const getFrame = async (width: number, height: number, pixels: Pixel[]) => {
   return sharp({
      create: {
         width,
         height,
         channels: 4,
         background: { r: 230, g: 230, b: 230, alpha: 1.0 },
      },
   })
      .composite(
         pixels.map((p) => {
            return {
               input: {
                  create: {
                     width: 1,
                     height: 1,
                     channels: 4,
                     background: { r: 0, g: 0, b: 0, alpha: 1 },
                  },
               },
               left: p.x,
               top: p.y,
            };
         })
      )
      .toBuffer();
};

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string } }
) {
  const width = 24
  const height = 24

  const { slug } = params;
  console.log(slug);

  const num = parseInt(slug, 16)
  const a = num % width
  const b = Math.floor(num / width)

  const arr = await Promise.all([
    getFrame(width, height, [{ x: a, y: b}, { x: a+1, y: b}]),
    getFrame(width, height, [{ x: a, y: b+1}, { x: a+1, y: b+1}]),
    getFrame(width, height, [{ x: a, y: b+2}, { x: a+1, y: b+2}]),
  ])

  const imageBuffer = GIF_from_Frames(width, height, arr);
  const response = new NextResponse(imageBuffer);
  response.headers.set("content-type", "image/gif");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}