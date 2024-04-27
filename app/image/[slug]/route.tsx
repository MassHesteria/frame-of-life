import { NextRequest, NextResponse } from 'next/server';
const { GIFEncoder } = require('gifenc');

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string}}
) {
  const size = 356
  const num = 20

  const rows = Math.floor(size/num)
  const cols = rows

  const { slug } = params;
  console.log(slug);

  const cnt = parseInt(slug, 16)
  const a = cnt % cols
  const b = Math.floor(cnt / rows)

  console.log('row:',b,'col:',a)

  const palette = [
    [240, 240, 240],
    [200, 200, 200],
    [40, 220, 220],
  ]

  const grid = new Uint8Array(size*size)

  for (let i = num; i < size; i += (num+1)) {
    for (let j = 0; j < size; j++) {
      grid[(j*size) + i] = 1
      grid[(i*size) + j] = 1
    }
  }

  const setCell = (row: number, col: number, color: number) => {
    const idx = (row * size * (num + 1)) + (col * (num + 1))

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        grid[idx + i + (size * j)] = color
      }
    }
  }

  const gif = GIFEncoder()
  for (let i = 0; i < 15; i++) {
    setCell(b + i, a + i, 2)
    gif.writeFrame(grid, size, size, { palette, delay: 1000 })
  }
  gif.finish()

  const response = new NextResponse(gif.bytesView());
  response.headers.set("content-type", "image/gif");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}