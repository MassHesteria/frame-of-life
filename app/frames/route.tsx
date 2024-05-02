/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { State, frames, getHostName } from "../frames";

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`
  const baseRoute = getHostName() + "/frames?ts=" + timestamp
  const state = ctx.state as State;

  // Modes:
  // 0 - Edit
  // 1 - Instructions
  // 2 - Options
  // 3 - Play
  //
  // NOTES:
  // - Allow share without button press
  // - URL with color and encoded image as search params

  if (ctx.message) {
    if (!ctx.message.isValid) {
      throw new Error('Could not validate request')
    }
    const encoded = 2000004000007
    const color =
      state.color.red.toString(16).padStart(2, '0') +
      state.color.green.toString(16).padStart(2, '0') +
      state.color.blue.toString(16).padStart(2, '0')
    return {
      image: getHostName() + `/image/${encoded}?color=${color}`,
      imageOptions: {
        aspectRatio: '1:1'
      },
      buttons: [
        <Button action="post" target={baseRoute}>
          Play
        </Button>,
        <Button action="post" target={baseRoute + '&mode=1'}>
          Instructions
        </Button>,
        <Button action="post" target={baseRoute + '&mode=2'}>
          Options
        </Button>,
        <Button action="post" target={baseRoute + '&mode=2'}>
          Share
        </Button>,
      ]
    };
  }

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

  return {
    image: 'logo.png',
    buttons: [
      <Button action="post" target={baseRoute}>
        Play
      </Button>,
      <Button action="post" target={baseRoute + '&mode=1'}>
        Instructions
      </Button>,
    ]
  };
});

export const GET = handleRequest;
export const POST = handleRequest;