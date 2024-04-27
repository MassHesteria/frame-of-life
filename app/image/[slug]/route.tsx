import { NextRequest, NextResponse } from 'next/server';
const { createCanvas } = require('canvas');
const { GIFEncoder } = require('gifenc');
import fs from 'fs'
import { BACKGROUND } from './background'

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

function textToPixels(
   text: string,
   width: number,
   height: number,
   fontSize: number,
   fontFamily: string
) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Set the text attributes
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = "black";
  ctx.textTransform = 'uppercase'

  // Calculate text position to center it
  const textWidth = ctx.measureText(text).width;
  const textX = (width - textWidth) / 2;
  const textY = (height - fontSize) / 2;

  // Render the text on the canvas
  ctx.fillText(text, textX, textY);

  // Read pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const binaryArray = [];
  for (let i = 0; i < data.length; i += 4) {
    // Assuming the background is white, and text is black
    const isBlack = data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0;
    binaryArray.push(isBlack ? 3 : 0);
  }

  return binaryArray;
}

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string}}
) {
  const searchParams = req.nextUrl.searchParams
  const single = searchParams.get('single')
  let family = searchParams.get('family')
  if (!family) {
    family = 'Arial'
  }

  const size = 374
  const num = 14

  const rows = 25
  const cols = 25

  const { slug } = params;
  //console.log(slug);

  const palette = [
    [240, 240, 240],
    [210, 210, 210],
    [40, 220, 220],
    [128, 0, 128],
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

  const logo = size * 40
  /*const full = new Uint8Array(logo + grid.length)
  const text = textToPixels("Frame of Life", size, 40, 36, family)

  for (let i = 0; i < text.length; i++) {
    full[i] = text[i]
  }

  for (let i = logo - size; i < logo; i++) {
    full[i] = 1
  }

  let output = 'export const BACKGROUND = [\n'
  full.forEach(p => output += `${p},`)
  output += '\n];';
  fs.writeFileSync('background.js', output)*/

  const full = new Uint8Array(BACKGROUND);

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
    full.set(grid, logo)
    gif.writeFrame(full, size, size + 40, { palette, delay: 250 })
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