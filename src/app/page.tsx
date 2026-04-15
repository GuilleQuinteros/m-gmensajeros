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
    <div style={{ fontFamily: "var(--font-sans)" }}>
      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px", borderBottom:"0.5px solid #f0ede4", background:"#fff" }}>
        <div>
          <span style={{ fontSize:17, fontWeight:700, color:"#B8860B" }}>M&G Mensajeros</span>
          <span style={{ fontSize:11, color:"#888", display:"block" }}>Logistica & Mensajeria</span>
        </div>
        <Link href="/auth/login" style={{ padding:"8px 18px", background:"#1a1a1a", color:"#fff", borderRadius:8, fontSize:13, fontWeight:500, textDecoration:"none" }}>
          Acceso corporativo →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ background:"#1a1a1a", padding:"64px 32px 48px", minHeight:320 }}>
        <div style={{ maxWidth:500 }}>
          <p style={{ fontSize:11, fontWeight:500, color:"#B8860B", letterSpacing:".12em", textTransform:"uppercase", marginBottom:14 }}>Logistica inteligente</p>
          <h1 style={{ fontSize:38, fontWeight:700, color:"#fff", lineHeight:1.15, marginBottom:16 }}>
            Tu paquete,<br /><span style={{ color:"#B8860B" }}>siempre en movimiento</span>
          </h1>
          <p style={{ fontSize:14, color:"#aaa", lineHeight:1.7, marginBottom:28 }}>
            Seguimiento en tiempo real desde que sale del deposito hasta que llega a tu puerta.
          </p>
          <Link href="/seguimiento" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#B8860B", color:"#fff", padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>
            Rastrear mi envio →
          </Link>
        </div>
      </section>
      
      {/* Tracking band */}
      <section style={{ background:"#B8860B", padding:32 }}>
        
        <div style={{ maxWidth:520, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:6 }}>Rastrear mi envio</h2>
          <p style={{ fontSize:13, color:"#fde68a", marginBottom:18 }}>Ingresa el numero que recibiste por WhatsApp. Ejemplo: ENV-0042</p>
          <form action="/seguimiento" method="get" style={{ display:"flex", gap:8 }}>
            <input name="nro" placeholder="ENV-0001" style={{ flex:1, padding:"12px 16px", borderRadius:8, border:"none", fontSize:15, fontWeight:500, letterSpacing:".05em", textTransform:"uppercase", textAlign:"center" }} />
            <button type="submit" style={{ padding:"12px 22px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Ver estado →
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:"#1a1a1a", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:14, fontWeight:600, color:"#B8860B" }}>M&G Mensajeros</span>
        <span style={{ fontSize:11, color:"#555" }}>Buenos Aires, Argentina</span>
        <Link href="/auth/login" style={{ fontSize:12, color:"#B8860B", textDecoration:"none" }}>Acceso corporativo →</Link>
      </footer>
    </div>
  );
}