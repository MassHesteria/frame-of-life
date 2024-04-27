import { NextRequest, NextResponse } from 'next/server';
const { GIFEncoder } = require('gifenc');

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string}}
) {
  const searchParams = req.nextUrl.searchParams
  const single = searchParams.get('single')

  const size = 356
  const num = 20

  const rows = Math.floor(size/num)
  const cols = rows

  const { slug } = params;
  //console.log(slug);

  const palette = [
    [240, 240, 240],
    [200, 200, 200],
    [40, 220, 220],
  ]

  const data = new Uint8Array(rows*cols)
  let pos = 0
  for (let i = 0; i < slug.length; i++) {
    const hex = parseInt(slug[i], 16)
    for (let j = 0; j < 4; j++) {
      data[pos++] = (hex >> j) & 0x1
    }
  }

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

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (data[(row * rows) + col] == 1) {
        setCell(row, col, 2)
      }
    }
  }

  const gif = GIFEncoder()
  const frames = single ? 1 : 15
  for (let i = 0; i < frames; i++) {
    gif.writeFrame(grid, size, size, { palette, delay: 1000 })
  }
  gif.finish()

  const response = new NextResponse(gif.bytesView());
  response.headers.set("content-type", "image/gif");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}