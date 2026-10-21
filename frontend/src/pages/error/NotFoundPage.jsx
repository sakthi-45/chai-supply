import { Icon } from '../../components/Icon.jsx'

export function NotFoundPage({ navigate }) {
  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#252525]">
      <main className="mx-auto max-w-[1190px] px-6 pb-10 pt-10 max-[680px]:px-4 max-[680px]:pt-7">
        <section className="grid min-h-[330px] grid-cols-[.85fr_1.15fr] items-center gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-5">
          <div>
            <span className="inline-flex rounded-full bg-[#f8eee6] px-3 py-1.5 text-[8px] font-extrabold tracking-[.8px] text-[#a76526]">
              PAGE NOT FOUND
            </span>
            <h1 className="mt-4 max-w-[400px] font-serif text-[42px] font-bold leading-[1.04] tracking-[-1px] text-[#30251f] max-[680px]:text-[34px]">
              404 – Page Not Found
            </h1>
            <p className="mt-3 max-w-[355px] text-[11px] leading-6 text-[#81776e]">
              This page isn’t on our supply route. Let’s get you back to the good stuff.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#6f3e25] px-4 text-[9px] font-bold text-white hover:bg-[#522d19]"
                onClick={() => navigate('home')}
                type="button"
              >
                <Icon name="arrow" /> Home
              </button>
              <button
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#e8ded2] bg-white px-4 text-[9px] font-bold text-[#6f3e25] hover:bg-[#fff5ec]"
                onClick={() => navigate('dashboard')}
                type="button"
              >
                Back to dashboard
              </button>
            </div>
          </div>

          <SupplyRouteIllustration />
        </section>

      </main>

      <footer className="border-t border-[#eee5de] bg-white">
        <div className="mx-auto flex max-w-[1190px] flex-wrap items-center justify-between gap-3 px-6 py-4 text-[8px] text-[#918579] max-[680px]:px-4">
          <span>© 2025 ChaiSupply. Your local wholesale marketplace.</span>
          <div className="flex flex-wrap gap-4">
            <button className="hover:text-[#6f3e25]" onClick={() => navigate('about')} type="button">Get in touch</button>
            <button className="hover:text-[#6f3e25]" onClick={() => navigate('about')} type="button">Help centre</button>
            <button className="hover:text-[#6f3e25]" onClick={() => navigate('login')} type="button">Sign in / Portal</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SupplyRouteIllustration() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#eee5de] bg-[radial-gradient(ellipse_at_50%_80%,#e9f2ec_0%,#fffaf7_70%)] p-4 shadow-[0_14px_35px_rgba(71,43,24,.07)]">
      <svg className="h-auto w-full" viewBox="0 0 560 310" role="img" aria-label="Illustration of a delivery truck following a winding route between a tea shop and a destination">
        <defs>
          <linearGradient id="route-road" x1="0" x2="1">
            <stop offset="0" stopColor="#db8a4e" />
            <stop offset="1" stopColor="#bc7046" />
          </linearGradient>
        </defs>
        <circle cx="466" cy="60" r="32" fill="#fff0df" />
        <circle cx="84" cy="83" r="16" fill="#e7efea" />
        <circle cx="494" cy="255" r="11" fill="#e4eee8" />
        <path d="M44 218c75-7 84-54 143-54s73 74 142 74 62-93 126-93h54" fill="none" stroke="#d8e7dd" strokeWidth="25" strokeLinecap="round" />
        <path d="M44 218c75-7 84-54 143-54s73 74 142 74 62-93 126-93h54" fill="none" stroke="url(#route-road)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 11" />

        <g transform="translate(45 182)">
          <rect x="0" y="25" width="71" height="52" rx="3" fill="#b96e42" />
          <path d="M-5 27 34 0l41 27Z" fill="#628675" />
          <rect x="11" y="40" width="18" height="37" fill="#f8d7ad" />
          <rect x="39" y="40" width="22" height="15" fill="#dce9e4" />
          <path d="M36 78v-13h8v13" fill="#f8d7ad" />
          <rect x="-9" y="77" width="91" height="5" rx="2" fill="#78533e" />
          <circle cx="17" cy="86" r="7" fill="#49372a" />
          <circle cx="62" cy="86" r="7" fill="#49372a" />
          <circle cx="17" cy="86" r="2.5" fill="#fff" />
          <circle cx="62" cy="86" r="2.5" fill="#fff" />
        </g>

        <g transform="translate(421 94)">
          <path d="M30 0 56 11v25c0 24-15 40-26 47C19 76 4 60 4 36V11Z" fill="#fff4e4" stroke="#d9822b" strokeWidth="3" />
          <path d="m19 39 8 8 16-18" fill="none" stroke="#6f8e78" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform="translate(199 59)">
          <rect width="126" height="36" rx="18" fill="#fff" stroke="#eee5de" />
          <circle cx="20" cy="18" r="10" fill="#eaf2ee" />
          <path d="M14 19h11l-2 5h-7zM16 16h6l2 3h-10z" fill="#6f8e78" />
          <text x="38" y="22" fill="#745a48" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700">On the way!</text>
        </g>

        <g transform="translate(111 111)">
          <path d="M19 0 37 7v17c0 16-10 27-18 32C11 51 1 40 1 24V7Z" fill="#fff" stroke="#9db8a7" strokeWidth="2" />
          <path d="M11 25h16M19 17v16" stroke="#6f8e78" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>

  

    



  )
}
