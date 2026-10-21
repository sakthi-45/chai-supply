import { Brand } from './Brand.jsx'

const chaiSupplyImage =
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=85'

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
          <div className="relative mt-[26px] flex min-h-[190px] max-w-[430px] items-end overflow-hidden rounded-xl border border-[#e8ded2] shadow-[0_8px_24px_rgba(66,42,26,.12)] max-[680px]:mt-[13px] max-[680px]:min-h-[150px]">
            <img
              alt="A cup of chai served with biscuits"
              className="absolute inset-0 size-full object-cover"
              src={chaiSupplyImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#321d12]/90 via-[#321d12]/20 to-transparent" />
            <div className="relative z-[1] p-4 text-white max-[680px]:p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[.75px] text-[#f4c38c]">
                Your local wholesale essentials
              </p>
              <p className="mt-1 font-serif text-[20px] leading-tight max-[680px]:text-[17px]">
                Chai, snacks & daily supplies
              </p>
              <p className="mt-1 text-[9px] text-white/85">
                From trusted local vendors, all in one place.
              </p>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
