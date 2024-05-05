export const Examples = () => {
  return (
    <div tw="flex h-full w-full flex-col" style={{backgroundColor: '#F0F0F0'}}>
      <div tw="flex flex-col w-full pt-12 px-4 items-center">
        <h2 tw="flex flex-col font-bold tracking-tight text-7xl text-left text-amber-900">
          <span tw="" style={{color: '#800080'}}>Frame of Life <span tw="pl-7 pt-5 text-5xl text-black">by MassHesteria</span></span>
        </h2>
      </div>
      <div tw="flex flex-col px-14">

        <span tw="pt-10 text-5xl" style={{color: '#18BCBC'}}>Example A - Glider</span>
        <span tw="pl-10 pt-6">Gliders are the smallest spaceship in Game of Life. They travel across the screen over a series of time steps.</span>

        <span tw="pt-10 text-5xl" style={{color: '#18BCBC'}}>Example B - Ship in a Bottle</span>
        <span tw="pl-10 pt-6">Oscillators repeat a pattern over a series of time steps. This oscillator was found by Bill Gosper.</span>

        <span tw="pt-10 text-5xl" style={{color: '#18BCBC'}}>Clear</span>
        <span tw="pl-10 pt-6">Marks all cells as dead</span>

        <span tw="pt-10 text-5xl" style={{color: '#18BCBC'}}>Back</span>
        <span tw="pl-10 pt-6">Return to the Edit page without making changes to the current cells</span>
      </div>
    </div>
  )
}
