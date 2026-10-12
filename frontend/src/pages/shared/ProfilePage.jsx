import { PageTitle } from '../../components/PageTitle.jsx'

export function ProfilePage({ role, notify, authUser, roleName }) {
  const profileName = authUser?.displayName || authUser?.email?.split('@')[0] || roleName
  const initials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        text="Manage your ChaiSupply account and marketplace role."
      />
      <section className="profile-card [margin-bottom:15px] [padding:18px] [display:flex] [align-items:center] [gap:14px] [border:1px_solid_var(--border)] [border-radius:9px] [background:white] [&_>_div]:[flex:1] [&_h2]:[margin:0_0_4px] [&_h2]:[color:#4a3221] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-size:18px] [&_p]:[margin-bottom:7px] [&_p]:[color:#80766e] [&_p]:[font-size:9px] max-[680px]:[align-items:flex-start] max-[680px]:[flex-wrap:wrap] max-[680px]:[&_.button]:[margin-left:65px] profile-card">
        <span className="profile-avatar [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:50%] [color:var(--brown)] [background:#f5e8d8] [font-size:9px] [font-weight:800] profile-avatar-large [width:52px] [height:52px] [font-size:14px]">
          {initials}
        </span>
        <div>
          <h2>{profileName}</h2>
          <p>
            {authUser?.email || (role === 'supplier' ? 'Verified supplier · Bengaluru' : role === 'admin' ? 'Administrator' : 'Tea-shop owner')}
          </p>
          <span className="verified-badge [padding:3px_5px] [border-radius:4px] [color:var(--green)] [background:#eff5ee] [font-size:8px]">
            ✓ Verified account
          </span>
        </div>
        <button
          className="button [min-height:42px] [padding:0_17px] [border:1px_solid_transparent] [border-radius:7px] [display:inline-flex] [justify-content:center] [align-items:center] [gap:9px] [font-size:12px] [line-height:1.2] [font-weight:700] [cursor:pointer] [transition:background_.18s,_border-color_.18s,_transform_.18s] hover:[transform:translateY(-1px)] [&_.icon]:[width:15px] [&_.icon]:[height:15px] button-outline [color:var(--brown)] [background:white] [border-color:var(--border)] hover:[border-color:#cfaa89] hover:[background:#fff9f3]"
          onClick={() => notify('Profile details saved')}
        >
          Edit profile
        </button>
      </section>
      <section className="profile-card [margin-bottom:15px] [padding:18px] [display:flex] [align-items:center] [gap:14px] [border:1px_solid_var(--border)] [border-radius:9px] [background:white] [&_>_div]:[flex:1] [&_h2]:[margin:0_0_4px] [&_h2]:[color:#4a3221] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-size:18px] [&_p]:[margin-bottom:7px] [&_p]:[color:#80766e] [&_p]:[font-size:9px] role-card [&_select]:[min-height:34px] [&_select]:[padding:0_9px] [&_select]:[border:1px_solid_var(--border)] [&_select]:[border-radius:5px] [&_select]:[color:#4e4034] [&_select]:[background:white] [&_select]:[font-size:9px]">
        <div>
          <h2>Your workspace</h2>
          <p>Your account is registered as a {role === 'supplier' ? 'seller' : role}.</p>
        </div>
      </section>
    </>
  )
}
