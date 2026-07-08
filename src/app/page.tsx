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
    <div style={{ fontFamily: "Arial, sans-serif", color: "#1a1a1a", background: "#fff" }}>

      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px", borderBottom:"1px solid #e8e4d8", background:"#fff", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:"#1a1a1a", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#B8860B", fontWeight:800, fontSize:11, letterSpacing:-1 }}>M&G</span>
          </div>
          <div>
            <span style={{ fontSize:15, fontWeight:700, color:"#1a1a1a", letterSpacing:"-.3px" }}>M&G Mensajeros</span>
            <span style={{ fontSize:10, color:"#888", display:"block", marginTop:-2 }}>Logistica & Mensajeria</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <Link href="/seguimiento" style={{ fontSize:13, color:"#555", textDecoration:"none" }}>Seguimiento</Link>
          <span style={{ fontSize:13, color:"#555" }}>Servicios</span>
          <span style={{ fontSize:13, color:"#555" }}>Integracion</span>
        </div>
        <Link href="/auth/login" style={{ padding:"8px 18px", background:"#B8860B", color:"#fff", borderRadius:6, fontSize:13, fontWeight:600, textDecoration:"none" }}>
          Acceso corporativo →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ background:"#1a1a1a", padding:"80px 32px 0", display:"grid", gridTemplateColumns:"1fr 420px", gap:48, alignItems:"flex-end", overflow:"hidden", minHeight:440 }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(184,134,11,.12)", border:"1px solid rgba(184,134,11,.25)", borderRadius:20, padding:"4px 12px", marginBottom:20 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#B8860B" }} />
            <span style={{ fontSize:11, fontWeight:600, color:"#B8860B", letterSpacing:".1em", textTransform:"uppercase" as const }}>Logistica inteligente</span>
          </div>
          <h1 style={{ fontSize:42, fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:16, letterSpacing:"-.5px" }}>
            Envios que llegan.<br />
            <span style={{ color:"#B8860B" }}>Siempre.</span>
          </h1>
          <p style={{ fontSize:15, color:"#888", lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
            Sistema de gestion logistica de ultima generacion. Trazabilidad completa, verificacion de identidad en entrega y notificaciones automaticas para cada pedido.
          </p>
          <div style={{ display:"flex", gap:12, alignItems:"center", paddingBottom:48 }}>
            <Link href="/seguimiento" style={{ padding:"13px 26px", background:"#B8860B", color:"#fff", borderRadius:8, fontSize:14, fontWeight:600, textDecoration:"none" }}>
              Rastrear mi envio →
            </Link>
            <span style={{ padding:"13px 26px", background:"transparent", color:"#aaa", border:"1px solid #333", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>
              Ver integracion API
            </span>
          </div>
          <div style={{ display:"flex", gap:32, paddingBottom:48 }}>
            {[
              { num:"100%", label:"Trazabilidad" },
              { num:"DNI", label:"Verificacion" },
              { num:"API", label:"Integracion" },
            ].map((s, i) => (
              <>
                {i > 0 && <div key={`d-${i}`} style={{ width:1, background:"#222", alignSelf:"stretch" }} />}
                <div key={s.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28, fontWeight:700, color: i === 0 ? "#B8860B" : "#fff", lineHeight:1 }}>{s.num}</div>
                  <div style={{ fontSize:11, color:"#555", marginTop:4, textTransform:"uppercase" as const, letterSpacing:".08em" }}>{s.label}</div>
                </div>
              </>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ paddingBottom:0 }}>
          <div style={{ background:"#111", borderRadius:"12px 12px 0 0", border:"1px solid #2a2a2a", borderBottom:"none", padding:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                <div key={c} style={{ width:8, height:8, borderRadius:"50%", background:c }} />
              ))}
              <span style={{ fontSize:11, color:"#555", marginLeft:"auto" }}>Dashboard — M&G Mensajeros</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
              {[
                { num:"48", label:"Total envios", color:"#B8860B" },
                { num:"31", label:"Entregados", color:"#28c840" },
                { num:"12", label:"En camino", color:"#ffbd2e" },
              ].map(s => (
                <div key={s.label} style={{ background:"#1a1a1a", border:"1px solid #222", borderRadius:6, padding:10 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:s.color, marginBottom:2 }}>{s.num}</div>
                  <div style={{ fontSize:9, color:"#444" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
              {[
                { num:"ENV-0048", nombre:"Romina Ventura", bg:"#1a3a1a", color:"#28c840", label:"Entregado" },
                { num:"ENV-0047", nombre:"Carlos Lopez", bg:"#3a2e0a", color:"#ffbd2e", label:"En camino" },
                { num:"ENV-0046", nombre:"Maria Garcia", bg:"#1a2a3a", color:"#6eb5ff", label:"En deposito" },
              ].map(r => (
                <div key={r.num} style={{ background:"#1a1a1a", border:"1px solid #222", borderRadius:6, padding:"8px 10px", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:10, color:"#B8860B", fontWeight:600, minWidth:60 }}>{r.num}</span>
                  <span style={{ fontSize:10, color:"#666", flex:1 }}>{r.nombre}</span>
                  <span style={{ fontSize:8, padding:"2px 7px", borderRadius:10, fontWeight:600, background:r.bg, color:r.color }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tracking band */}
      <section style={{ background:"#B8860B", padding:"40px 32px" }}>
        <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#fff", marginBottom:6 }}>Rastrear mi envio</h2>
          <p style={{ fontSize:13, color:"#fde68a", marginBottom:20 }}>Ingresa el numero que recibiste por email. Ejemplo: ENV-0042</p>
          <form action="/seguimiento" method="get" style={{ display:"flex", gap:8, maxWidth:480, margin:"0 auto" }}>
            <input name="nro" placeholder="ENV-0001" style={{ flex:1, padding:"13px 16px", borderRadius:8, border:"none", fontSize:15, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" as const, textAlign:"center" as const, outline:"none" }} />
            <button type="submit" style={{ padding:"13px 22px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" as const }}>
              Ver estado →
            </button>
          </form>
        </div>
      </section>

      {/* Servicios */}
      <section style={{ padding:"64px 32px", background:"#fafaf8" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <span style={{ fontSize:11, fontWeight:600, color:"#B8860B", letterSpacing:".1em", textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>Nuestros servicios</span>
          <h2 style={{ fontSize:26, fontWeight:700, color:"#1a1a1a", marginBottom:8 }}>Todo lo que necesita tu logistica</h2>
          <p style={{ fontSize:14, color:"#666" }}>Tecnologia pensada para empresas que necesitan operar con precision y escala</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:900, margin:"0 auto" }}>
          {[
            { icon:"📦", bg:"#FDF6E3", titulo:"Seguimiento en tiempo real", desc:"Cada envio tiene su propio link de tracking. El comprador sabe exactamente donde esta su paquete en todo momento." },
            { icon:"🪪", bg:"#E8F5E9", titulo:"Entrega verificada con DNI", desc:"El transportista verifica la identidad del receptor escaneando el codigo de barras del DNI argentino antes de confirmar la entrega." },
            { icon:"📧", bg:"#EEF2FF", titulo:"Notificaciones automaticas", desc:"El comprador recibe emails automaticos cuando su pedido llega al deposito y cuando sale a domicilio." },
            { icon:"🔌", bg:"#FFF3E0", titulo:"API de integracion", desc:"Conecta tu tienda online directamente con nuestro sistema. Compatible con E3, WooCommerce y cualquier plataforma con API." },
            { icon:"📊", bg:"#F3E8FF", titulo:"Reportes y facturacion", desc:"Reportes por zona, por transportista y por periodo. Exportacion en CSV. Remitos con numeracion tipo factura letra R." },
            { icon:"📱", bg:"#E0F7FA", titulo:"App para transportistas", desc:"Portal mobile optimizado para el transportista. Ve sus envios, contacta al cliente y confirma la entrega desde el celular." },
          ].map(s => (
            <div key={s.titulo} style={{ background:"#fff", border:"1px solid #e8e4d8", borderRadius:12, padding:24 }}>
              <div style={{ width:40, height:40, borderRadius:8, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, fontSize:18 }}>{s.icon}</div>
              <h3 style={{ fontSize:14, fontWeight:600, color:"#1a1a1a", marginBottom:6 }}>{s.titulo}</h3>
              <p style={{ fontSize:12, color:"#777", lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding:"64px 32px", background:"#fff" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <span style={{ fontSize:11, fontWeight:600, color:"#B8860B", letterSpacing:".1em", textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>Como funciona</span>
          <h2 style={{ fontSize:26, fontWeight:700, color:"#1a1a1a" }}>Del pedido a la puerta en 4 pasos</h2>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", maxWidth:800, margin:"0 auto" }}>
          {[
            { n:1, titulo:"Se registra el pedido", desc:"La tienda carga el envio manual o via API. El comprador recibe confirmacion." },
            { n:2, titulo:"Llega al deposito", desc:"El paquete ingresa al deposito de M&G y se notifica al comprador." },
            { n:3, titulo:"Sale a domicilio", desc:"El transportista asignado sale con el paquete. El comprador recibe el aviso." },
            { n:4, titulo:"Entrega verificada", desc:"Se verifica el DNI del receptor y se confirma la entrega en el sistema." },
          ].map((s, i, arr) => (
            <>
              <div key={s.n} style={{ flex:1, textAlign:"center", padding:"0 16px" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"#1a1a1a", color:"#B8860B", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", border:"2px solid #B8860B" }}>{s.n}</div>
                <h4 style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", marginBottom:4 }}>{s.titulo}</h4>
                <p style={{ fontSize:11, color:"#888", lineHeight:1.5 }}>{s.desc}</p>
              </div>
              {i < arr.length - 1 && <div key={`l-${i}`} style={{ flexShrink:0, width:60, height:1, background:"#e0ddd5", marginTop:22 }} />}
            </>
          ))}
        </div>
      </section>

      {/* Integracion */}
      <section style={{ background:"#1a1a1a", padding:"64px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <span style={{ fontSize:11, fontWeight:600, color:"#B8860B", letterSpacing:".1em", textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>Integracion tecnica</span>
            <h2 style={{ fontSize:26, fontWeight:700, color:"#fff", marginBottom:12, lineHeight:1.2 }}>Tu tienda conectada en minutos</h2>
            <p style={{ fontSize:13, color:"#777", lineHeight:1.7, marginBottom:24 }}>La API de M&G Mensajeros esta lista para conectarse con cualquier plataforma de e-commerce. Sin intermediarios, sin configuraciones complejas.</p>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
              {[
                "Autenticacion por API key",
                "Deteccion automatica de zona por CP o partido",
                "Webhook al confirmar venta en E3",
                "Respuesta con numero de envio y link de tracking",
                "Documentacion tecnica completa disponible",
              ].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#B8860B", flexShrink:0 }} />
                  <span style={{ fontSize:13, color:"#999" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:"#0a0a0a", border:"1px solid #222", borderRadius:10, padding:20, fontFamily:"monospace", fontSize:11, color:"#aaa", lineHeight:1.8 }}>
            <span style={{ color:"#444" }}>{"// Registrar envio al confirmar compra"}</span><br /><br />
            <span style={{ color:"#B8860B" }}>POST</span> <span style={{ color:"#6eb5ff" }}>mgmensajeros.com.ar/api/v1/envios</span>
            <br /><br />
            {"{"}<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"nombre"</span>: <span style={{ color:"#a8d4a8" }}>"Romina"</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"apellido"</span>: <span style={{ color:"#a8d4a8" }}>"Ventura"</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"partido"</span>: <span style={{ color:"#a8d4a8" }}>"LANUS"</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"pedidoExterno"</span>: <span style={{ color:"#a8d4a8" }}>"392522"</span><br />
            {"}"}<br /><br />
            <span style={{ color:"#444" }}>{"// Respuesta"}</span><br /><br />
            {"{"}<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"numeroEnvio"</span>: <span style={{ color:"#a8d4a8" }}>"ENV-0048"</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"trackingUrl"</span>: <span style={{ color:"#a8d4a8" }}>"mgmensajeros.com.ar/t/..."</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#B8860B" }}>"zona"</span>: <span style={{ color:"#a8d4a8" }}>"Provincia"</span><br />
            {"}"}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:"#0f0f0f", padding:"28px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #1a1a1a" }}>
        <div>
          <span style={{ fontSize:14, fontWeight:700, color:"#B8860B" }}>M&G Mensajeros</span>
          <span style={{ fontSize:11, color:"#444", display:"block", marginTop:1 }}>Logistica & Mensajeria — Buenos Aires, Argentina</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          <Link href="/seguimiento" style={{ fontSize:12, color:"#444", textDecoration:"none" }}>Seguimiento</Link>
          <span style={{ fontSize:12, color:"#444" }}>API Docs</span>
          <Link href="/auth/login" style={{ fontSize:12, color:"#B8860B", textDecoration:"none" }}>Acceso corporativo</Link>
        </div>
        <span style={{ fontSize:11, color:"#333" }}>mgmensajeros.com.ar</span>
      </footer>

    </div>
  );
}