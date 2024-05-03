/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { State, frames, getHostName } from "../frames";

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

  let cells = initCells
  let count = initCount
  let color = initColor
  if (!cells) {
    cells = state.cells
  }
  if (!count) {
    count = state.count
  }
  if (!color) {
    color = state.color
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
    const encoded = '000020000020000C1'
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

  const encoded = '000020000020000C1'
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