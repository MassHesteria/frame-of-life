/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { State, frames, getHostName } from "../frames";
import { decodeCells, encodeCells } from "../frames";

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
          <Button action="post" target={baseRoute + '&mode=1'}>
            Instructions
          </Button>,
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
        <Button action="post" target={baseRoute + '&mode=1'}>
          Instructions
        </Button>,
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
  // 1 - Instructions
  // 2 - Options
  // 3 - Play
  //
  // NOTES:
  // - Allow share without button press
  // - URL with color and encoded image as search params

  if (!ctx.message.isValid) {
    throw new Error('Could not validate request')
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
    console.log(encoded)
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
        <Button action="post" target={baseRoute + "&mode=1"}>
          Play
        </Button>,
        <Button action="post" target={baseRoute}>
          Toggle Cell
        </Button>,
        <Button action="post" target={baseRoute + "&mode=2"}>
          Options
        </Button>,
        <Button action="post" target={baseRoute + "&mode=2"}>
          Instructions
        </Button>,
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
      <Button action="post" target={baseRoute + "&mode=0"}>
        Edit
      </Button>,
      <Button action="post" target={baseRoute + "&mode=2"}>
        Options
      </Button>,
      <Button action="post" target={baseRoute + "&mode=3"}>
        Instructions
      </Button>,
      <Button action="link" target={baseRoute + "&mode=2"}>
        Share
      </Button>,
    ],
  };

    /*
    console.log(JSON.stringify(ctx))
    const fid = 373258
    let values = await getPFPs(fid)
    if (values.length <= 0) {
      return {
        image: (
          <div>Install Action and Bookmark PFPs</div>
        ),
        buttons: [
          <Button action="post" target={baseRoute}>
            Click
          </Button>,
        ],
      }
    }

    if (ctx.pressedButton) {
      if (ctx.pressedButton.index == 1) {
        state.index = (state.index + 1) % values.length
      } else if (ctx.pressedButton.index == 2) {
        await removePFP(fid, values[state.index])
        values = await getPFPs(fid)
        state.index %= values.length
      }
    }

    const pfp = values[state.index]
    const userData = await getUserDataForFid({ fid: pfp.fid })
    const profileLink = `https://warpcast.com`
    let buttonText = userData?.displayName
    if (!buttonText) {
      buttonText = 'No profile available'
    }

    const getButtons = () => {
      // Show remove button for manage mode
      if (state.manage) {
        return [
          <Button action="post" target={baseRoute}>
            Next ⏭
          </Button>,
          <Button action="post" target={baseRoute}>
            Remove ❌
          </Button>,
          <Button action="link" target={profileLink}>
            {buttonText}
          </Button>,
        ]
      }
      return [
          <Button action="post" target={baseRoute}>
            Next ⏭
          </Button>,
          <Button action="link" target={profileLink}>
            {buttonText}
          </Button>,
      ]
    }

    return {
      image: pfp.url,
      imageOptions: {
        aspectRatio: '1:1',
      },
      buttons: getButtons(),
      state
    }
   }

  const installLink = 'https://warpcast.com/~/add-cast-action?url=' +
    encodeURIComponent(getHostName() + '/action')*/

});

export const GET = handleRequest;
export const POST = handleRequest;