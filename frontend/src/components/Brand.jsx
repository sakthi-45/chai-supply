export function Brand({ light = false }) {
  return (
    <a className={`brand [display:inline-flex] [align-items:center] [gap:8px] [text-decoration:none] [color:var(--brown)] [flex:0_0_auto] ${light ? 'brand-light' : ''}`} href="#home" onClick={(event) => event.preventDefault()}>
      <span className="brand-mark [display:grid] [width:35px] [height:35px] [place-items:center] [border-radius:9px] [background:var(--brown)] [color:#fff5e8] [&_svg]:[width:30px] [&_svg]:[height:30px] [&_svg]:[fill:none] [&_svg]:[stroke:currentColor] [&_svg]:[stroke-width:1.6] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_.brand-box]:[fill:#e7a54f] [&_.brand-box]:[stroke:#e7a54f] max-[680px]:[width:32px] max-[680px]:[height:32px] [&_.brand-box]:[fill:#e7a54f] [&_.brand-box]:[stroke:#e7a54f]" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="img">
          <path d="M9 16h19v8.5A8.5 8.5 0 0 1 19.5 33h-2A8.5 8.5 0 0 1 9 24.5V16Z" />
          <path d="M28 18h2.5a4 4 0 0 1 0 8H28M12 12h18M17 8h9M17 3v5" />
          <path d="M5 35h28v2H5z" className="brand-box" />
        </svg>
      </span>
      <span className="brand-copy [display:flex] [flex-direction:column] [line-height:1.05] [&_strong]:[font-family:Georgia,_serif] [&_strong]:[font-size:17px] [&_strong]:[letter-spacing:-.45px] [&_small]:[margin-top:4px] [&_small]:[font-size:7px] [&_small]:[letter-spacing:1.05px] [&_small]:[font-weight:800] [&_small]:[color:#a27550] max-[680px]:[&_strong]:[font-size:15px]"><strong>ChaiSupply</strong><small>YOUR DAILY WHOLESALE</small></span>
    </a>
  )
}
