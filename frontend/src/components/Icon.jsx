export function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    cart: <><path d="M3 4h2l2.4 11.5h10.8L21 8H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    leaf: <><path d="M20 4c-8 0-14 3.5-14 10a6 6 0 0 0 6 6c6.5 0 10-6 8-16Z" /><path d="M4 21c3-5 6-8 12-11" /></>,
  }
  return <svg className="icon [width:17px] [height:17px] [flex:0_0_auto]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.check}</svg>
}
