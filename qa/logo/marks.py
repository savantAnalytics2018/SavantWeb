G='#173D31'; T='#0B6B60'; A='#D7A56F'; P='#E7EFE8'; C='#F7F6F2'
marks = {
 # A: orchestrator — ring, core, three satellites (matches the site animation)
 'A': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="{G}" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="{G}"/><circle cx="32" cy="10" r="4.5" fill="{T}"/><circle cx="51" cy="43" r="4.5" fill="{T}"/><circle cx="13" cy="43" r="4.5" fill="{A}"/></svg>''',
 # B: S monogram from two arcs, teal + green, on a rounded tile
 'B': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{G}"/><path d="M44 20a12 10 0 0 0-24 0c0 12 24 8 24 22a12 10 0 0 1-24 0" fill="none" stroke="{C}" stroke-width="6" stroke-linecap="round"/><circle cx="46" cy="18" r="4" fill="{A}"/></svg>''',
 # C: data-to-legible — three bars resolving into one line, with an accent node
 'C': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{P}"/><path d="M14 44 L14 32 M24 44 L24 24 M34 44 L34 16" stroke="{G}" stroke-width="6" stroke-linecap="round"/><path d="M34 16 L50 16" stroke="{T}" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="16" r="5" fill="{A}"/></svg>''',
}
for k,v in marks.items(): open(f'qa/logo/mark-{k}.svg','w').write(v)
# Preview sheet HTML
html='<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:32px;background:#fff;font-family:system-ui;color:#14251F;width:1136px}h2{font:600 14px system-ui;letter-spacing:.1em;color:#46574F;margin:0 0 10px}.row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin-bottom:28px}.card{border:1px solid #D3DDD5;border-radius:12px;padding:20px;background:#F7F6F2}.wm{display:flex;align-items:center;gap:12px;font-family:Georgia,serif;font-size:26px;margin:12px 0 18px}.wm img{width:34px;height:34px}.tab{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #D3DDD5;border-radius:8px 8px 0 0;padding:8px 14px;font:13px system-ui;margin-right:8px}.tab img{width:16px;height:16px}.dark{background:#173D31;color:#F7F6F2}.big img{width:120px;height:120px}.lab{font:600 12px system-ui;color:#0B6B60;letter-spacing:.1em}.desc{font:13px/1.4 system-ui;color:#46574F;margin-top:10px}</style><body>'
desc={'A':'Orchestrator. Ring, core, satellites — the same idea as the hero animation. Reads as “systems, coordinated.”','B':'Monogram. A single-stroke S on a deep-green tile with the warm accent dot. Most conventional, strongest at 16px.','C':'Legibility. Bars resolving into a clean line — “complex systems becoming legible.” Calm, analytical.'}
html+='<div class="row">'
for k in marks:
    svg=open(f'qa/logo/mark-{k}.svg').read()
    import base64; d='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
    html+=f'<div class="card"><div class="lab">OPTION {k}</div><div class="wm"><img src="{d}">Savant Analytics</div><div><span class="tab"><img src="{d}">Savant Analytics — Enterprise AI</span><span class="tab" style="background:#eee">Mail</span></div><div class="big" style="margin-top:18px"><img src="{d}"></div><div class="desc">{desc[k]}</div></div>'
html+='</div><div class="row">'
for k in marks:
    svg=open(f'qa/logo/mark-{k}.svg').read(); d='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
    html+=f'<div class="card dark"><div class="lab" style="color:#D7A56F">OPTION {k} — on dark</div><div class="wm"><img src="{d}">Savant Analytics</div></div>'
html+='</div></body>'
open('qa/logo/sheet.html','w').write(html)
