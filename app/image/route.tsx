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

const rc = () => {
  return Math.floor(Math.random() * (255 - 0 + 1)) + 0
}

export async function GET(req: NextRequest) {
  const a = await sharp({
    create: {
      width: 20,
      height: 20,
      channels: 4,
      background: { r: 0, g: rc(), b: 0, alpha: 1.0 }
    }
  })
  .raw()
  .toBuffer()

  const b = await sharp({
    create: {
      width: 20,
      height: 20,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1.0 }
    }
  })
  .raw()
  .toBuffer()

  const imageBuffer = GIF_from_Frames(20, 20, [a, b])
  const response = new NextResponse(imageBuffer)
  response.headers.set('content-type', 'image/gif');
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response;
}