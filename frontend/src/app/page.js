import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <nav>
        <div className="container">
          <div className="nav-brand">Sehat<span>Setu</span></div>
          <div className="nav-links">
            <Link href="/login">Log in</Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.95rem" }}>
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "7rem 1.5rem 5rem", textAlign: "center", position: "relative" }}>
        <div className="container">
          <div style={{ 
            display: "inline-block", 
            padding: "0.5rem 1rem", 
            background: "rgba(16, 185, 129, 0.1)", 
            color: "var(--primary)", 
            borderRadius: "9999px",
            fontWeight: "700",
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}>
            Advanced Healthcare Management
          </div>
          <h1 style={{ marginBottom: "1.5rem", maxWidth: "800px", margin: "0 auto 1.5rem" }}>
            Your Health, <span style={{ color: "var(--primary)" }}>Our Priority</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--gray-600)", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            Connect with qualified doctors, manage medical records securely, and book appointments with precision and ease.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary">Start your journey</Link>
          </div>
        </div>
      </section>

      {/* Statistics Section (Cijfers equivalent) */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid var(--gray-200)", borderBottom: "1px solid var(--gray-200)", backgroundColor: "white" }}>
        <div className="container text-center">
          <h3 style={{ marginBottom: "3rem" }}>Trusted by thousands across the nation</h3>
          <div className="grid grid-4" style={{ textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--primary)", marginBottom: "0.5rem" }}>17+</div>
              <p style={{ fontWeight: "600", color: "var(--secondary)" }}>Regions Covered</p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--primary)", marginBottom: "0.5rem" }}>80+</div>
              <p style={{ fontWeight: "600", color: "var(--secondary)" }}>Medical Practices</p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--primary)", marginBottom: "0.5rem" }}>150</div>
              <p style={{ fontWeight: "600", color: "var(--secondary)" }}>Expert Specialists</p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--primary)", marginBottom: "0.5rem" }}>10k</div>
              <p style={{ fontWeight: "600", color: "var(--secondary)" }}>Patients Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="section-light">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center", gap: "4rem" }}>
            <div>
              <h2 style={{ fontSize: "2.5rem" }}>Prevention meets <span style={{ color: "var(--primary)" }}>precision</span></h2>
              <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                Our platform goes beyond just booking. We use advanced analytics to help you stay ahead of health issues before they become serious.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: "600" }}>
                  <span style={{ color: "var(--primary)" }}>✓</span> Personalized health insights
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: "600" }}>
                  <span style={{ color: "var(--primary)" }}>✓</span> Secure medical records
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: "600" }}>
                  <span style={{ color: "var(--primary)" }}>✓</span> Instant doctor communication
                </li>
              </ul>
            </div>
            <div style={{ 
              backgroundColor: "var(--primary)", 
              borderRadius: "2rem", 
              padding: "3rem", 
              color: "white",
              boxShadow: "0 20px 40px rgba(16,185,129,0.2)"
            }}>
              <h3 style={{ color: "white", marginTop: 0 }}>Smart Care</h3>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem" }}>
                We believe that maintaining your health should be as seamless as managing your calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Specialists Section */}
      <section style={{ padding: "6rem 1.5rem", backgroundColor: "#f8fafc" }}>
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: "3rem" }}>Meet our top specialists</h2>
          <div className="grid grid-3">
            {[
              { name: "Dr. Sarah Jenkins", role: "Cardiologist", icon: "👩‍⚕️" },
              { name: "Dr. Michael Chen", role: "General Practice", icon: "👨‍⚕️" },
              { name: "Dr. Emma Watson", role: "Pediatrics", icon: "👩‍⚕️" }
            ].map((doc, i) => (
              <div key={i} className="card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem", backgroundColor: "#ecfdf5", width: "100px", height: "100px", margin: "0 auto 1.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", justifyContent: "center" }}>
                  {doc.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{doc.name}</h3>
                <p style={{ color: "var(--primary)", fontWeight: "600", marginTop: "0.5rem" }}>{doc.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-mint">
        <div className="container">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ color: "var(--secondary)", marginBottom: "2rem" }}>FAQ</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { q: "How do I book an appointment?", a: "Simply log in to your dashboard and click 'Book New Appointment'." },
                { q: "Are my medical records secure?", a: "Yes, we use military-grade encryption to protect your health data." },
                { q: "Can I do a telehealth consultation?", a: "Telehealth features are currently being rolled out to supported regions." }
              ].map((faq, i) => (
                <div key={i} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{faq.q}</h4>
                  <p style={{ margin: "0.5rem 0 0", color: "var(--gray-600)" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="grid grid-3">
            <div>
              <h3 style={{ color: "white", marginBottom: "1.5rem" }}>Sehat Setu</h3>
              <p>Your journey to better healthcare accessibility starts right here.</p>
            </div>
            <div>
              <h4 style={{ color: "white", marginBottom: "1.5rem" }}>Quick Links</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li><Link href="/register">Sign Up</Link></li>
                <li><Link href="/login">Patient Login</Link></li>
                <li><Link href="#">Doctor Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "white", marginBottom: "1.5rem" }}>Contact</h4>
              <p>support@sehatsetu.com</p>
              <p>+1-800-HEALTHY</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
