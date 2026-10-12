import { Brand } from '../../components/Brand.jsx'

const values = [
  {
    title: 'Local suppliers, trusted quality',
    description: 'We bring tea shops together with nearby dairies, wholesalers, and snack makers that understand the morning rush.',
    icon: '🤝',
  },
  {
    title: 'One simpler way to order',
    description: 'Compare everyday essentials and coordinate orders across suppliers from one straightforward marketplace.',
    icon: '🧺',
  },
  {
    title: 'Built around your business',
    description: 'From clear minimum quantities to reliable early deliveries, ChaiSupply is designed for the way local shops work.',
    icon: '☀️',
  },
]

export function AboutPage({ navigate }) {
  return (
    <div className="min-h-screen bg-[#fff9f1] text-[#252525]">
      <header className="flex h-[72px] items-center justify-between border-b border-[#e8ded2] bg-white px-6 sm:px-10">
        <Brand />
        <button
          className="rounded-md border border-[#e8ded2] bg-white px-4 py-2 text-sm font-semibold text-[#6f3e25] transition hover:bg-[#fff9f3]"
          onClick={() => navigate('home')}
          type="button"
        >
          Back to home
        </button>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9e642e]">About ChaiSupply</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-[#4f2f1e] sm:text-5xl">
            Better mornings start with better sourcing.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#71675e]">
            ChaiSupply helps tea shops and cafés get the ingredients they need from trusted local suppliers, all in one place and ready for the day ahead.
          </p>
          <button
            className="mt-8 rounded-lg bg-[#6f3e25] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#522d19]"
            onClick={() => navigate('catalogue')}
            type="button"
          >
            Explore supplies
          </button>
        </section>
        <section className="mt-14 grid gap-5 sm:grid-cols-3" aria-label="What we value">
          {values.map((value) => (
            <article className="rounded-xl border border-[#e8ded2] bg-white p-6 shadow-sm" key={value.title}>
              <span className="grid size-11 place-items-center rounded-lg bg-[#f7eee5] text-xl" aria-hidden="true">
                {value.icon}
              </span>
              <h2 className="mt-5 font-serif text-xl text-[#4f2f1e]">{value.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#71675e]">{value.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
