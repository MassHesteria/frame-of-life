/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import {
  Color,
  State,
  decodeColor,
  encodeColor,
  frames,
  getHostName,
} from "../frames";
import { decodeCells, encodeCells } from "../frames";
import { Instructions } from "./compoments/instructions";
import { Examples } from "./compoments/examples";

const getBaseRoute = () => {
  return getHostName() + `/frames?ts=${Date.now()}`;
};

const getButtonMode = (mode: number, title: string) => {
  return (
    <Button action="post" target={getBaseRoute() + `&mode=${mode}`}>
      {title}
    </Button>
  );
};

const getShareLink = (cells: boolean[][], color: Color, count: number) => {
  const shareLink =
    "https://warpcast.com/~/compose?text=Checkout what I made in Frame of Life!" +
    "&embeds[]=" +
    encodeURIComponent(
      getBaseRoute() +
        "&cells=" +
        encodeCells(cells) +
        "&color=" +
        encodeColor(color) +
        `&count=${count}`
    );
  return shareLink
};

const getButton_Instructions = () => getButtonMode(3, "Help 📄");
const getButton_Examples = () => getButtonMode(2, "Examples 📂");
const getButton_Play = () => getButtonMode(1, "Play ▶");
const getButton_Edit = () => getButtonMode(0, "Edit ✏");
const getButton_Toggle = () => getButtonMode(0, "Toggle ☑");

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`;
  const baseRoute = getHostName() + "/frames?ts=" + timestamp;
  const initCells = ctx.searchParams?.cells;
  const initColor = ctx.searchParams?.color;
  const initCount = ctx.searchParams?.count;

  // No message? User has not clicked a button yet
  if (!ctx.message) {
    // This is for sharing
    if (initCells && initColor && initCount) {
      return {
        image:
          getHostName() +
          `/image/${initCells}?color=${initColor}&frames=${initCount}&ts=${timestamp}`,
        imageOptions: {
          aspectRatio: "1:1",
        },
        buttons: [
          <Button
            action="post"
            target={
              baseRoute +
              `&mode=0&cells=${initCells}&color=${initColor}&count=${initCount}`
            }
          >
            Start
          </Button>,
          getButton_Instructions(),
        ],
      };
    }

    // Normal starting frame
    return {
      image: "logo.png",
      buttons: [
        <Button action="post" target={baseRoute}>
          Start
        </Button>,
        getButton_Instructions(),
      ],
    };
  }

  const mode = ctx.searchParams?.mode || 0;
  const state = ctx.state as State;

  let cells = state.cells;
  let count = state.count;
  let color = state.color;

  if (count == 0) {
    if (initCells && initColor && initCount) {
      cells = decodeCells(initCells, 21, 23);
      color = decodeColor(initColor);
      count = parseInt(initCount);
    } else {
      cells = decodeCells('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAoAACIAADgAAAAAAxgAEUQAYowBBQQBatAAAAAAAAAA==', 21, 23)
      color = decodeColor(null);
      count = 200;
    }
  } else {
    if (initCells) {
      cells = decodeCells(initCells, 21, 23);
    }
  }

  // Modes:
  // 0 - Edit
  // 1 - Play
  // 2 - Options
  // 3 - Instructions

  if (!ctx.message.isValid) {
    throw new Error("Could not validate request");
  }

  if (mode == 3) {
    return {
      image: <Instructions />,
      imageOptions: {
        aspectRatio: "1:1",
      },
      state: {
        cells,
        count,
        color,
      },
      buttons: [
        getButton_Play(),
        getButton_Edit(),
        getButton_Examples(),
        <Button action="link" target={getShareLink(cells, color, count)}>
          Share
        </Button>,
      ],
    };
  }

  if (mode == 2) {
    const example_A =
      "AAAAAAAAQAAAQAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
    const example_B =
      "AAAABgYAEhIAKlQBkCYEMMILnnQJAJAJMkAClAAFKABJkgEgEgXPOghhhAyBMAVKgAkJAAwMAAAAAAAAAA==";
    const example_C = "====";
    return {
      image: <Examples />,
      imageOptions: {
        aspectRatio: "1:1",
      },
      state: {
        cells,
        count,
        color,
      },
      buttons: [
        <Button action="post" target={baseRoute + `&mode=0&cells=${example_A}`}>
          A ✈
        </Button>,
        <Button action="post" target={baseRoute + `&mode=0&cells=${example_B}`}>
          B 🚢
        </Button>,
        <Button action="post" target={baseRoute + `&mode=0&cells=${example_C}`}>
          Clear ❌
        </Button>,
        <Button action="post" target={baseRoute + `&mode=0`}>
          Back 🔙
        </Button>,
      ],
    };
  }

  if (mode == 0) {
    const inputText: string | undefined = ctx.message.inputText?.toLowerCase();
    if (inputText) {
      const inputCells = inputText.split(" ");
      inputCells.forEach((cell: string) => {
        if (cell.length != 2) {
          return;
        }
        const row = cell.charCodeAt(0) - "a".charCodeAt(0);
        const col = cell.charCodeAt(1) - "a".charCodeAt(0);
        if (row < 0 || row > 21) {
          return;
        }
        if (col < 0 || col > 23) {
          return;
        }
        cells[row][col] = !cells[row][col];
      });
    }

    return {
      image:
        getHostName() +
        "/image/" +
        encodeCells(cells) +
        "?color=" +
        encodeColor(color) +
        `&frames=1&ts=${timestamp}`,
      imageOptions: {
        aspectRatio: "1:1",
      },
      state: {
        cells,
        count,
        color,
      },
      textInput: "Cells (row, col): aw bc ...",
      buttons: [
        getButton_Play(),
        getButton_Toggle(),
        getButton_Examples(),
        getButton_Instructions(),
      ],
    };
  }

  return {
    image:
      getHostName() +
      "/image/" +
      encodeCells(cells) +
      "?color=" +
      encodeColor(color) +
      `&frames=${count}&ts=${timestamp}`,
    imageOptions: {
      aspectRatio: "1:1",
    },
    state: {
      cells,
      count,
      color,
    },
    buttons: [
      getButton_Edit(),
      getButton_Examples(),
      getButton_Instructions(),
      <Button action="link" target={getShareLink(cells, color, count)}>
        Share
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
