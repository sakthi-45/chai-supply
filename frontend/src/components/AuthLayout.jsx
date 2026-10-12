import { Brand } from './Brand.jsx'

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_25%_65%,_#f7e9db,_transparent_50%),_#fffaf4] px-[30px] max-[680px]:px-4">
      <header className="mx-auto flex h-[72px] max-w-[1080px] items-center max-[680px]:h-[60px]">
        <Brand />
      </header>
      <main className="mx-auto grid min-h-[calc(100vh_-_72px)] max-w-[940px] grid-cols-[1fr_390px] items-center gap-[65px] py-[30px] pb-[50px] max-[680px]:min-h-0 max-[680px]:grid-cols-1 max-[680px]:gap-[18px] max-[680px]:py-[15px] max-[680px]:pb-[30px]">
        <div className="max-[680px]:[&_h1]:my-2 max-[680px]:[&_h1]:text-[31px] max-[680px]:[&>p]:text-[10px]">
          <span className="inline-block text-[9px] font-extrabold leading-[1.25] tracking-[.65px] text-[#9e642e]">
            A BETTER MORNING STARTS HERE
          </span>
          <h1 className="my-3 font-serif text-[42px] leading-[1.1] text-[#4f2f1e]">
            Your daily supplies,<br />all in one place.
          </h1>
          <p className="max-w-[400px] text-[12px] leading-[1.7] text-[#7e7268]">
            Trusted local suppliers. Fresh deliveries before the first boil. More time for your customers.
          </p>
          <div className="mt-[30px] flex max-w-[390px] items-center gap-[10px] rounded-lg border border-[#e8ded2] bg-white p-3 shadow-[0_8px_24px_rgba(66,42,26,.07)] max-[680px]:mt-[13px] [&_b]:text-[9px] [&_b]:text-[#49372a] [&_div]:flex [&_div]:flex-1 [&_div]:flex-col [&_div]:gap-[3px] [&_small]:text-[8px] [&_small]:text-[#877c72]">
            <span className="grid size-[35px] place-items-center rounded-md bg-[#f7eee5] text-[18px]">🥛</span>
            <div>
              <b>Tomorrow&apos;s first delivery</b>
              <small>Fresh milk · Assam tea · Paper cups</small>
            </div>
            <span className="text-[8px] font-bold text-[#3f7d58]">On schedule</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
