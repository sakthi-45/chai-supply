export function Toast({ message }) {
  if (!message) return null

  return (
    <div
      className="toast [position:fixed] [z-index:60] [right:22px] [bottom:86px] [display:flex] [align-items:center] [gap:9px] [padding:12px_17px] [border:1px_solid_#e7ddd1] [border-radius:8px] [background:white] [color:#423329] [box-shadow:0_8px_30px_#33231224] [font-size:12px]"
      role="status"
    >
      <span className="toast-check [display:grid] [width:20px] [height:20px] [place-items:center] [border-radius:50%] [color:white] [background:var(--green)] [font-size:12px]">
        ✓
      </span>
      {message}
    </div>
  )
}
