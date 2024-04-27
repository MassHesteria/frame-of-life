import { NextRequest, NextResponse } from 'next/server';
const { GIFEncoder } = require('gifenc');

// Function to get the value of a cell at a specific row and column
function getCellValue(
   grid: Uint8Array,
   rows: number,
   cols: number,
   row: number,
   col: number
) {
   if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return 0; // Out of bounds, treat as dead
   }
   return grid[row * cols + col];
}

// Function to count the number of live neighbors for a cell
function countLiveNeighbors(
   grid: Uint8Array,
   rows: number,
   cols: number,
   row: number,
   col: number
) {
   let count = 0;
   for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
         if (dr === 0 && dc === 0) continue; // Skip the current cell
         count += getCellValue(grid, rows, cols, row + dr, col + dc);
      }
   }
   return count;
}

// Glider: 40000001000083

const computeNextFrame = (data: Uint8Array, rows: number, cols: number) => {
   const newGrid = new Uint8Array(rows * cols);
   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         const neighbors = countLiveNeighbors(data, rows, cols, row, col);
         const cell = getCellValue(data, rows, cols, row, col);
         if (cell === 1) {
            // Any live cell with fewer than two live neighbors dies
            // Any live cell with two or three live neighbors lives
            // Any live cell with more than three live neighbors dies
            newGrid[row * cols + col] =
               neighbors === 2 || neighbors === 3 ? 1 : 0;
         } else {
            // Any dead cell with exactly three live neighbors becomes a live cell
            newGrid[row * cols + col] = neighbors === 3 ? 1 : 0;
         }
      }
   }
   newGrid.forEach((v, i) => (data[i] = v));
};

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string}}
) {
  const searchParams = req.nextUrl.searchParams
  const single = searchParams.get('single')

  const size = 374
  const num = 14

  const rows = 25
  const cols = 25

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


  const gif = GIFEncoder()
  const frames = single ? 1 : 100
  for (let i = 0; i < frames; i++) {
    // Update the cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (data[(row * rows) + col] == 1) {
          setCell(row, col, 2)
        } else {
          setCell(row, col, 0)
        }
      }
    }
    gif.writeFrame(grid, size, size, { palette, delay: 250 })
    if (data.find(p => p > 0) == undefined) {
      break;
    }
    computeNextFrame(data, rows, cols)
  }
  gif.finish()

  const response = new NextResponse(gif.bytesView());
  response.headers.set("content-type", "image/gif");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}