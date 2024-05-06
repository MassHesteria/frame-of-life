import { decodeColor } from "@/app/frames"

export const Instructions = () => {
  const defaultColor = decodeColor(null)
  const colorCode = `rgb(${defaultColor.red}, ${defaultColor.green}, ${defaultColor.blue})`
  return (
    <div tw="flex h-full w-full flex-col" style={{backgroundColor: '#F0F0F0'}}>
      <div tw="flex flex-col w-full pt-12 px-4 items-center">
        <h2 tw="flex flex-col font-bold tracking-tight text-7xl text-left text-amber-900">
          <span tw="" style={{color: '#800080'}}>Frame of Life <span tw="pl-7 pt-5 text-5xl text-black">by MassHesteria</span></span>
        </h2>
      </div>
      <div tw="flex flex-col px-14">
        <span tw="text-6xl" style={{color: colorCode}}>Instructions</span>
        <span tw="pt-4">
          Conway&apos;s Game of Life has a grid of square cells which have two states, live or dead. Each time step,
          cells interact with their eight neighbors using these rules:
        </span>
        <span tw="pl-10 pt-8">1. Live cells with fewer than two live neighbors die</span>
        <span tw="pl-10 pt-6">2. Live cells with two or three live neighbors stay alive</span>
        <span tw="pl-10 pt-6">3. Live cells with more than three live neighbors die</span>
        <span tw="pl-10 pt-6">4. Dead cells with exactly three live neighbors become</span>
        <span tw='pl-20'>live cells.</span>
        <div tw="flex flex-row pt-8" style={{flexWrap: 'wrap'}}>
          <span tw="pr-3 pt-2">Select</span>
          <span tw="py-2 px-3 border border-black">Edit ✏</span>
          <span tw="pl-3 pt-2"> then adjust cell states by typing pairs of</span>
        </div>
        <div tw="flex flex-row pt-3" style={{flexWrap: 'wrap'}}>
          <span tw="pt-2 pr-3">letters (e.g., bh = row b, col h) and clicking</span>
          <span tw="py-2 px-3 border border-black">Toggle ☑</span>
          <span tw="pl-1 pt-2 pr-3">.</span>
        </div>
        <div tw="flex flex-row pt-3" style={{flexWrap: 'wrap'}}>
          <span tw="pt-2 pr-3">Press</span>
          <span tw="py-2 px-3 border border-black">Play ▶</span>
          <span tw="pt-2 pl-3">to visualize the game.</span>
        </div>
      </div>
    </div>
  )
}
