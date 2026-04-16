import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = (session.user as any).role;
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "pdv") redirect("/pdv/mis-envios");
    if (role === "transportista") redirect("/trans/mis-envios");
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#1a1a1a" }}>

      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px", borderBottom:"0.5px solid #f0ede4", background:"#fff", position:"sticky", top:0, zIndex:10 }}>
        <div>
          <span style={{ fontSize:17, fontWeight:700, color:"#B8860B" }}>M&G Mensajeros</span>
          <span style={{ fontSize:11, color:"#888", display:"block", marginTop:-2 }}>Logistica & Mensajeria</span>
        </div>
        <Link href="/auth/login" style={{ padding:"8px 18px", background:"#1a1a1a", color:"#fff", borderRadius:8, fontSize:13, fontWeight:500, textDecoration:"none" }}>
          Acceso corporativo →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ background:"#1a1a1a", padding:"64px 32px 0", display:"flex", gap:40, alignItems:"flex-end", overflow:"hidden", minHeight:380 }}>
        <div style={{ flex:1, paddingBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:500, color:"#B8860B", letterSpacing:".12em", textTransform:"uppercase", marginBottom:14 }}>Logistica inteligente</p>
          <h1 style={{ fontSize:38, fontWeight:700, color:"#fff", lineHeight:1.15, marginBottom:16 }}>
            Tu paquete,<br />
            <span style={{ color:"#B8860B" }}>siempre en movimiento</span>
          </h1>
          <p style={{ fontSize:14, color:"#aaa", lineHeight:1.7, maxWidth:420, marginBottom:28 }}>
            Seguimiento en tiempo real de tus envios. Desde que sale del deposito hasta que llega a tu puerta, te mantenemos informado.
          </p>
          <Link href="/seguimiento" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#B8860B", color:"#fff", padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>
            Rastrear mi envio →
          </Link>
        </div>
        {/* Ilustracion camion */}
        <div style={{ width:320, flexShrink:0, height:280 }}>
          <svg viewBox="0 0 320 280" fill="none" style={{ width:"100%", height:"100%" }}>
            <rect x="20" y="80" width="200" height="120" rx="12" fill="#2a2a2a" stroke="#B8860B" strokeWidth="1.5"/>
            <rect x="220" y="110" width="80" height="90" rx="8" fill="#222" stroke="#B8860B" strokeWidth="1.5"/>
            <rect x="228" y="118" width="40" height="32" rx="4" fill="#B8860B" opacity=".25"/>
            <rect x="272" y="118" width="22" height="32" rx="4" fill="#B8860B" opacity=".15"/>
            <circle cx="80" cy="210" r="22" fill="#111" stroke="#B8860B" strokeWidth="2"/>
            <circle cx="80" cy="210" r="10" fill="#B8860B" opacity=".4"/>
            <circle cx="200" cy="210" r="22" fill="#111" stroke="#B8860B" strokeWidth="2"/>
            <circle cx="200" cy="210" r="10" fill="#B8860B" opacity=".4"/>
            <circle cx="258" cy="210" r="18" fill="#111" stroke="#B8860B" strokeWidth="2"/>
            <circle cx="258" cy="210" r="8" fill="#B8860B" opacity=".4"/>
            <rect x="30" y="92" width="180" height="96" rx="6" fill="#232323"/>
            <rect x="40" y="102" width="80" height="14" rx="3" fill="#B8860B" opacity=".2"/>
            <rect x="40" y="120" width="120" height="8" rx="2" fill="#333"/>
            <rect x="40" y="132" width="100" height="8" rx="2" fill="#333"/>
            <rect x="40" y="144" width="60" height="8" rx="2" fill="#333"/>
            <line x1="0" y1="232" x2="320" y2="232" stroke="#333" strokeWidth="1"/>
            <rect x="60" y="50" width="14" height="30" rx="2" fill="#B8860B" opacity=".6"/>
            <rect x="54" y="44" width="26" height="8" rx="2" fill="#B8860B" opacity=".8"/>
          </svg>
        </div>
      </section>

      {/* Tracking band */}
      <section style={{ background:"#B8860B", padding:32 }}>
        <div style={{ maxWidth:560, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:6 }}>Rastrear mi envio</h2>
          <p style={{ fontSize:13, color:"#fde68a", marginBottom:18 }}>Ingresa el numero de envio que recibiste por WhatsApp</p>
          <form action="/seguimiento" method="get" style={{ display:"flex", gap:8 }}>
            <input
              name="nro"
              placeholder="ENV-0001"
              style={{ flex:1, padding:"12px 16px", borderRadius:8, border:"none", fontSize:15, fontWeight:500, letterSpacing:".05em", textTransform:"uppercase", textAlign:"center", outline:"none" }}
            />
            <button type="submit" style={{ padding:"12px 22px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
              Ver estado →
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"56px 32px", background:"#fafaf8" }}>
        <h2 style={{ textAlign:"center", fontSize:22, fontWeight:700, marginBottom:6 }}>Por que elegir M&G</h2>
        <p style={{ textAlign:"center", fontSize:13, color:"#888", marginBottom:36 }}>Tecnologia al servicio de tu envio</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:800, margin:"0 auto" }}>
          {[
            { bg:"#FDF6E3", titulo:"Seguimiento en tiempo real", texto:"Sabe exactamente donde esta tu paquete en cada momento del proceso." },
            { bg:"#E8F5E9", titulo:"Entrega verificada", texto:"Verificacion de identidad en cada entrega para que tu pedido llegue a quien corresponde." },
            { bg:"#E8F5E9", titulo:"Alertas por WhatsApp", texto:"Te avisamos en cada etapa del envio directamente a tu celular, sin apps extra." },
          ].map((f, i) => (
            <div key={i} style={{ background:"#fff", border:"0.5px solid #e8e4d8", borderRadius:12, padding:20 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:f.bg, marginBottom:12 }} />
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>{f.titulo}</h3>
              <p style={{ fontSize:12, color:"#666", lineHeight:1.6 }}>{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding:"56px 32px", background:"#fff" }}>
        <h2 style={{ textAlign:"center", fontSize:22, fontWeight:700, marginBottom:6 }}>Como funciona</h2>
        <p style={{ textAlign:"center", fontSize:13, color:"#888", marginBottom:36 }}>Simple y rapido en 4 pasos</p>
        <div style={{ display:"flex", alignItems:"flex-start", maxWidth:700, margin:"0 auto" }}>
          {[
            { n:1, titulo:"Se registra tu pedido", texto:"Racing Club carga tu pedido al sistema" },
            { n:2, titulo:"Llega al deposito", texto:"Recibis un WhatsApp con tu numero de seguimiento" },
            { n:3, titulo:"Sale a la calle", texto:"El transportista sale con tu paquete" },
            { n:4, titulo:"Entrega verificada", texto:"Confirman tu identidad y recibis tu pedido" },
          ].map((s, i, arr) => (
            <>
              <div key={s.n} style={{ flex:1, textAlign:"center", padding:"0 12px" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#B8860B", color:"#fff", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>{s.n}</div>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{s.titulo}</h4>
                <p style={{ fontSize:11, color:"#888", lineHeight:1.5 }}>{s.texto}</p>
              </div>
              {i < arr.length - 1 && (
                <div key={`line-${i}`} style={{ flexShrink:0, width:40, height:1, background:"#e0ddd5", marginTop:18 }} />
              )}
            </>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:"#1a1a1a", padding:"24px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:14, fontWeight:600, color:"#B8860B" }}>M&G Mensajeros</span>
        <span style={{ fontSize:11, color:"#666" }}>Logistica & Mensajeria — Buenos Aires, Argentina</span>
        <Link href="/auth/login" style={{ fontSize:12, color:"#B8860B", textDecoration:"none" }}>Acceso corporativo →</Link>
      </footer>

    </div>
  );
}