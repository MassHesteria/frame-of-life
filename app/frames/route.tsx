/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { State, frames, getHostName } from "../frames";
import { decodeCells, encodeCells } from "../frames";
import { Instructions } from "./compoments/instructions";

const getColor = (colorString: string) => {
  if (colorString == undefined) {
    return {
      red: 40,
      green: 220,
      blue: 220
    }
  }
  const num = parseInt(colorString, 16)
  return {
    red: (num >> 16) & 0xFF,
    green: (num >> 8) & 0xFF,
    blue: num & 0xFF
  }
}

const getBaseRoute = () => {
  return getHostName() + `/frames?ts=${Date.now()}`
}

const getButtonMode = (mode: number, title: string) => {
  return (
    <Button action="post" target={getBaseRoute() + `&mode=${mode}`}>
      {title}
    </Button>
  )
}

const getButton_Instructions = () => getButtonMode(3, 'Instructions')
const getButton_Options = () => getButtonMode(2, 'Options')
const getButton_Play = () => getButtonMode(1, "Play")
const getButton_Edit = () => getButtonMode(0, "Edit")
const getButton_Toggle = () => getButtonMode(0, "Toggle Cells")

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`
  const baseRoute = getHostName() + "/frames?ts=" + timestamp
  const initCells = ctx.searchParams?.cells
  const initColor = ctx.searchParams?.color
  const initCount = ctx.searchParams?.count

  // No message? User has not clicked a button yet
  if (!ctx.message) {

    // This is for sharing
    if (initCells && initColor && initCount) {
      return {
        image: getHostName() +
          `/image/${initCells}?color=${initColor}&frames=${initCount}&ts=${timestamp}`,
        imageOptions: {
          aspectRatio: "1:1",
        },
        buttons: [
          <Button action="post" target={baseRoute + `&mode=0&cells=${initCells}&color=${initColor}&count=${initCount}`}>
            Start
          </Button>,
          getButton_Instructions()
        ]
      };
    }
    
    // Normal starting frame
    return {
      image: 'logo.png',
      buttons: [
        <Button action="post" target={baseRoute}>
          Start
        </Button>,
        getButton_Instructions()
      ]
    };
  }

  const mode = ctx.searchParams?.mode || 0
  const state = ctx.state as State

  let cells = state.cells
  let count = state.count
  let color = state.color

  if (count == 0) {
    if (initCells && initColor && initCount) {
      cells = decodeCells(initCells, 21, 23)
      color = getColor(initColor)
      count = parseInt(initCount)
    } else {
      cells = []
      for (let i = 0; i < 21; i++) {
        const row = []
        for (let j = 0; j < 23; j++) {
          row.push(false)
        }
        cells.push(row)
      } 
      count = 100
    }
  }
  
  // Modes:
  // 0 - Edit
  // 1 - Play
  // 2 - Options
  // 3 - Instructions
  //
  // NOTES:
  // - Allow share without button press
  // - URL with color and encoded image as search params

  if (!ctx.message.isValid) {
    throw new Error('Could not validate request')
  }

  if (mode == 3) {
    return {
      image:
        <>
          <Instructions />
        </>,
      imageOptions: {
        aspectRatio: '1:1',
      },
      state: {
        cells,
        count,
        color
      },
      buttons: [
        getButton_Play(),
        getButton_Edit(),
        getButton_Options(),
        <Button action="link" target={baseRoute + "&mode=2"}>
          Share
        </Button>,
      ],
    }
  }
  if (mode == 0) {
    const inputText: string | undefined = ctx.message.inputText?.toLowerCase()
    if (inputText) {
      const inputCells = inputText.split(' ')
      console.log(inputCells)
      inputCells.forEach((cell: string) => {
        if (cell.length != 2) {
          return;
        }
        const row = cell.charCodeAt(0) - 'a'.charCodeAt(0) 
        const col = cell.charCodeAt(1) - 'a'.charCodeAt(0) 
        cells[row][col] = !cells[row][col]
      })
    }

    const encoded = encodeCells(cells)
    const colorStr =
      color.red.toString(16).padStart(2, '0') +
      color.green.toString(16).padStart(2, '0') +
      color.blue.toString(16).padStart(2, '0')

    return {
      image: getHostName() +
        `/image/${encoded}?color=${colorStr}&frames=1&ts=${timestamp}`,
      imageOptions: {
        aspectRatio: "1:1",
      },
      state: {
        cells,
        count,
        color
      },
      textInput: 'Enter cells: aw bc ...',
      buttons: [
        getButton_Play(),
        getButton_Toggle(),
        getButton_Options(),
        getButton_Instructions(),
      ],
    };
  }

  const encoded = encodeCells(cells)
  const colorStr =
    color.red.toString(16).padStart(2, '0') +
    color.green.toString(16).padStart(2, '0') +
    color.blue.toString(16).padStart(2, '0')
  return {
    image: getHostName() +
      `/image/${encoded}?color=${colorStr}&frames=${count}&ts=${timestamp}`,
    imageOptions: {
      aspectRatio: "1:1",
    },
    state: {
      cells,
      count,
      color
    },
    buttons: [
      getButton_Edit(),
      getButton_Options(),
      getButton_Instructions(),
      <Button action="link" target={baseRoute + "&mode=2"}>
        Share
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;