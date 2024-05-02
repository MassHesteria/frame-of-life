import { NextRequest, NextResponse } from 'next/server';
const { GIFEncoder, applyPalette } = require('gifenc');
import path from 'path'

const { promisify } = require("util");
const getPixels = promisify(require("get-pixels"));

async function readImage(file: string) {
  const { data, shape } = await getPixels(file);
  let width, height;
  if (shape.length === 3) {
    // PNG,JPG,etc...
    width = shape[0];
    height = shape[1];
  } else if (shape.length === 4) {
    // still GIFs might appear in frames, so [N,w,h]
    width = shape[1];
    height = shape[2];
  } else {
    throw new Error("Invalid shape " + shape.join(", "));
  }
  return { img_data: data, img_width: width, img_height: height };
}

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

// Glider: 2000004000007

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
  const color = searchParams.get('color')

  const getColor = () => {
    if (color == undefined) {
      return [ 40, 220, 220 ]
    }
    const num = parseInt(color, 16)
    return [
      (num >> 16) & 0xFF,
      (num >> 8) & 0xFF,
      num & 0xFF
    ]
  }

  const size = 374
  const num = 14

  const rows = 24
  const cols = 24

  const { slug } = params;
  //console.log(slug);

  const palette = [
    [240, 240, 240],
    [210, 210, 210],
    getColor(),
    [128, 0, 128],
    [0, 0, 0],
  ]

  const width = size
  const height = size - 40
  const grid = new Uint8Array(width*height)
  const data = new Uint8Array(rows*cols)

  let pos = 0
  for (let i = 0; i < slug.length; i++) {
    const hex = parseInt(slug[i], 16)
    for (let j = 0; j < 4; j++) {
      data[pos++] = (hex >> j) & 0x1
    }
  }

  // Draw the grid lines
  for (let i = num; i < width; i += (num+1)) {
    for (let j = num; j < width; j++) {
      grid[(j*width) + i] = 1
      grid[(i*width) + j] = 1
    }
  }

  const setCell = (row: number, col: number, color: number) => {
    const idx = (row * width * (num + 1)) + (col * (num + 1))

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        grid[idx + i + (width * j)] = color
      }
    }
  }

  const logo = size * 40
  let backgroundPath = path.join(process.cwd(), 'background-by-hand.png');
  const { img_data } = await readImage(backgroundPath)

  // Apply palette to RGBA data to get an indexed bitmap
  const index = applyPalette(img_data, palette, 'rgb444');

  // Initialize the buffer using the index bitmap
  const full = new Uint8Array(index)

  const gif = GIFEncoder()
  const frames = single ? 1 : 100
  for (let i = 0; i < frames; i++) {
    // Update the cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (data[(row * rows) + col] == 1) {
          setCell(row + 1, col + 1, 2)
        } else {
          setCell(row + 1, col + 1, 0)
        }
      }
    }
    // Copy the values from the grid into the full buffer
    let pos = logo + (size * 14)
    let k = size * 14
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (j < num) {
          pos++
          k++
          continue
        }
        full[pos++] = grid[k++]
      }
    }
    // Write the full buffer as a frame
    gif.writeFrame(full, size, size, { palette, delay: 250 })
    // Not moving anymore?
    if (data.find(p => p > 0) == undefined) {
      break;
    }
    // Update the cell stats
    computeNextFrame(data, rows, cols)
  }
  gif.finish()

  const response = new NextResponse(gif.bytesView());
  response.headers.set("content-type", "image/gif");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}