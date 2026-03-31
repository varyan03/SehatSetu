import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hover Navbar */}
      <nav style={{ background: "transparent", borderBottom: "none", paddingTop: "1.5rem", position: "absolute", width: "100%", zIndex: 50 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px" }}>
          <div className="nav-brand" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.75rem", fontWeight: "400", color: "#3d8a62" }}>
            {/* Logo Icon Match */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              <path d="M9 12h6"></path>
              <path d="M12 9v6"></path>
            </svg>
            <strong>Sehat</strong>Setu
          </div>
          <div className="nav-links" style={{ fontSize: "1rem", fontWeight: "300" }}>
            <Link href="/" style={{ color: "var(--gray-600)" }}>Home</Link>
            <Link href="/faq" style={{ color: "var(--gray-600)" }}>FAQ</Link>
            <Link href="/about" style={{ color: "var(--gray-600)" }}>About us</Link>
            <Link href="/register" className="btn btn-primary" style={{ backgroundColor: "#00df81", color: "white", fontWeight: "400", padding: "0.6rem 1.8rem", marginLeft: "1.5rem", boxShadow: "none", borderRadius: "9999px" }}>
              Book Appointment
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "8rem",
        paddingBottom: "4rem",
        backgroundColor: "#EBF1F1",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Massive White Background Text */}
        <div style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(8rem, 25vw, 30rem)",
          fontWeight: "600",
          color: "#F6F7F9",
          whiteSpace: "nowrap",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-0.04em",
          lineHeight: 1
        }}>
          HEALTH
        </div>

        {/* Central 3D Graphic Stacking Naturally */}
        <div style={{
          position: "relative",
          width: "450px",
          height: "450px",
          zIndex: 1,
          opacity: 0.95,
          pointerEvents: "none",
          maskImage: "radial-gradient(circle, black 46%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle, black 46%, transparent 68%)",
          mixBlendMode: "multiply",
          marginBottom: "-2rem",
          marginTop: "2rem"
        }}>
          <Image
            src="/hero-graphic.png"
            alt="Medical 3D Concept"
            fill
            style={{ objectFit: "contain" }}
            priority
            unoptimized={true}
          />
        </div>

        {/* Foreground Content Filling the Gap */}
        <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(3rem, 5.5vw, 5rem)",
            lineHeight: 1.1,
            marginBottom: "1rem",
            letterSpacing: "-1.5px"
          }}>
            <span style={{ color: "#214D4B", fontWeight: "700", display: "block" }}>Your Health In Focus,</span>
            <span style={{ color: "#3F8861", fontWeight: "700" }}>Your </span>
            <span style={{ color: "#41a471ff", fontWeight: "700" }}>Li</span>
            <span style={{ color: "#55b684ff", fontWeight: "700" }}>fe </span>
            <span style={{ color: "#66CF95", fontWeight: "700" }}>In Balance</span>
          </h1>
          <p style={{
            fontSize: "1.25rem",
            fontWeight: "400",
            color: "#214D4B",
            marginBottom: "0"
          }}>
            A new perspective on healthcare
          </p>
        </div>
      </section>

      {/* Preventative Medical Care Section */}
      <section style={{ padding: "0rem 1.5rem 3rem 1.5rem", backgroundColor: "#EBF1F1", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* <h2 style={{ fontSize: "3rem", margin: "0 0 0.5rem 0", color: "#214D4B", letterSpacing: "3px", fontWeight: "500" }}>
            Preventative Medical Care
          </h2>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "300", color: "#3D8A62", margin: "0 0 2rem 0" }}>
            that goes further
          </h3>
          <p style={{ fontSize: "1.1rem", color: "var(--gray-600)", marginBottom: "3rem", lineHeight: 1.8, fontWeight: "300" }}>
            The bridge to a life full of vitality. Discover how strong health is more than just the absence of illness – it is the key to more energy, mental clarity, and a deep sense of well-being. Start your journey to a richer life here.
          </p> */}
          <Link href="/register" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", backgroundColor: "#00df81", borderRadius: "9999px", color: "white", fontWeight: "300" }}>
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{
        position: "relative",
        padding: "8rem 1.5rem 8rem",
        backgroundColor: "#EBF1F1", /* Soft minty grey matching image background */
        overflow: "hidden"
      }}>
        {/* Faded Background Text */}
        <div style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(10rem, 22vw, 25rem)",
          fontWeight: "800",
          color: "#F6F7F9", /* Faint watermark */
          whiteSpace: "nowrap",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "0.05em",
        }}>
          Statistics
        </div>

        {/* Content Container */}
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "1200px" }}>

          {/* Header Block */}
          <div style={{ marginBottom: "4rem", maxWidth: "700px", textAlign: "left" }}>
            <h2 style={{
              fontSize: "clamp(3rem, 6vw, 4.5rem)",
              lineHeight: 1.1,
              color: "#163321",
              marginBottom: "1.5rem",
              fontWeight: "700",
              letterSpacing: "-1.5px"
            }}>
              <span style={{ display: "block" }}>Numbers</span>
              <span style={{ display: "block" }}>
                That <span style={{ color: "#00df81", fontWeight: "600" }}>Speak</span>
              </span>
            </h2>
            <p style={{
              fontSize: "1.4rem",
              fontWeight: "500",
              color: "#163321",
              marginBottom: "1rem",
              lineHeight: 1.4
            }}>
              Navigating risks and opportunities for a healthier tomorrow
            </p>
            <p style={{
              fontSize: "1.1rem",
              color: "#475569",
              lineHeight: 1.6,
              fontWeight: "400"
            }}>
              Discover key facts, backed by recognized research trends, <br className="hidden md:block" /> that shed light on heart health in our nation.
            </p>
          </div>

          {/* Grid Block */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem"
          }}>
            {[
              { val: "1.7", unit: "million", text: "people live with cardiovascular disease." },
              { val: "50", unit: "%", text: "of sudden cardiac deaths occur in people under 50." },
              { val: "100", unit: "+", text: "deaths per day from cardiovascular disease." },
              { val: "15", unit: "%", text: "of people in their thirties already deal with high blood pressure." },
              { val: "9000", unit: "+", text: "deaths per year from strokes." },
              { val: "100.000", unit: "+", text: "hospital admissions for heart failure per year." }
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                border: "1px solid rgba(0, 223, 129, 0.2)",
                borderRadius: "1rem",
                padding: "3rem 2rem",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
                backdropFilter: "blur(10px)"
              }}>
                <div style={{ fontSize: "3.5rem", fontWeight: "600", color: "#163321", marginBottom: "1rem", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "0.25rem", letterSpacing: "-1px" }}>
                  {stat.val} <span style={{ fontSize: "1.5rem", color: "#00df81", fontWeight: "500", letterSpacing: "normal" }}>{stat.unit}</span>
                </div>
                <p style={{ color: "#475569", fontSize: "1.05rem", margin: 0, fontWeight: "300", lineHeight: 1.5 }}>
                  {stat.text}
                </p>
              </div>
            ))}
          </div>

          {/* Button Block */}
          <div style={{ textAlign: "center" }}>
            <Link href="/register" className="btn" style={{
              backgroundColor: "#00df81",
              color: "white",
              padding: "1rem 3rem",
              borderRadius: "9999px",
              fontWeight: "400",
              fontSize: "1.1rem",
              boxShadow: "0 10px 25px rgba(0, 223, 129, 0.3)",
              border: "none",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}>
              Book Appointment
            </Link>
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
      <section style={{ padding: "0rem 1.5rem 8rem 1.5rem", backgroundColor: "#ffffff" }}>
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)", 
              color: "#163321", 
              fontWeight: "700", 
              letterSpacing: "-1px",
              marginBottom: "1rem" 
            }}>
              Meet our <span style={{ color: "#00df81" }}>Specialists</span>
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "600px", margin: "0 auto" }}>
              Dedicated professionals committed to providing you with the best personalized healthcare experience.
            </p>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem"
          }}>
            {[
              { 
                name: "Dr. Sarah Jenkins", 
                role: "Cardiologist", 
                img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
                exp: "12+ Years"
              },
              { 
                name: "Dr. Michael Chen", 
                role: "General Practice", 
                img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
                exp: "15+ Years"
              },
              { 
                name: "Dr. Emma Watson", 
                role: "Pediatrics", 
                img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=600&auto=format&fit=crop",
                exp: "8+ Years"
              }
            ].map((doc, i) => (
              <div key={i} className="specialist-card">
                <div style={{ position: "relative", height: "320px", width: "100%", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={doc.img} 
                    alt={doc.name} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      objectPosition: "center top"
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(4px)",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "2rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#00df81",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                  }}>
                    {doc.exp}
                  </div>
                </div>
                <div style={{ padding: "2rem 1.5rem", textAlign: "left" }}>
                  <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.25rem 0", color: "#163321", fontWeight: "600" }}>{doc.name}</h3>
                  <p style={{ color: "#00df81", margin: 0, fontSize: "1rem", fontWeight: "400" }}>{doc.role}</p>
                  
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "500", transition: "color 0.2s" }} className="view-profile-text">View Profile</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00df81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s" }} className="view-profile-icon">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-24 bg-[#ffffff] relative overflow-hidden">
        {/* Subtle Watermark/Background Graphic */}
        <div className="absolute opacity-[0.03] pointer-events-none z-0" style={{ top: "-5%", right: "-5%", width: "800px", height: "800px" }}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        <div className="container relative z-10" style={{ maxWidth: "1000px" }}>
          <div className="relative" style={{ backgroundColor: "#EBF1F1", borderRadius: "2rem", padding: "clamp(3rem, 6vw, 5rem)", boxShadow: "0 4px 30px rgba(0,0,0,0.03)" }}>
            
            <div style={{ marginBottom: "4rem" }}>
              <h2 className="font-semibold tracking-tight text-xl md:text-2xl mb-2" style={{ color: "#00df81" }}>
                From Data to Insight
              </h2>
              <h3 className="font-bold tracking-tight text-4xl m-0" style={{ color: "#163321", letterSpacing: "-1px" }}>
                How We Work
              </h3>
            </div>

            <div className="flex flex-col" style={{ gap: "4.5rem" }}>
              
              {/* Step 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "3rem" }}>
                <div className="flex gap-6 relative h-full">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="rounded-full text-white flex items-center justify-center text-xl font-semibold z-10" style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#00df81" }}>
                      01
                    </div>
                    {/* Vertical Line spanning height plus gap */}
                    <div className="hidden md:block absolute w-[2px] z-0" style={{ backgroundColor: "#00df81", top: "3.5rem", bottom: "-4.5rem", left: "1.7rem" }}></div>
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <h4 className="text-2xl font-semibold mt-0" style={{ color: "#163321", marginBottom: "0.75rem" }}>Data Collection & Intake</h4>
                    <p className="leading-relaxed mb-0" style={{ color: "#475569", fontSize: "1.05rem" }}>
                      Begin by securely entering your health data and symptoms into our platform. Our intuitive interface ensures that your medical history, current conditions, and lifestyle factors are accurately recorded to form a comprehensive health profile.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden" style={{ height: "260px", borderRadius: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" alt="Patient consultation providing health background" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "3rem" }}>
                <div className="flex gap-6 relative h-full">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="rounded-full text-white flex items-center justify-center text-xl font-semibold z-10" style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#00df81" }}>
                      02
                    </div>
                    {/* Vertical Line */}
                    <div className="hidden md:block absolute w-[2px] z-0" style={{ backgroundColor: "#00df81", top: "3.5rem", bottom: "-4.5rem", left: "1.7rem" }}></div>
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <h4 className="text-2xl font-semibold mt-0" style={{ color: "#163321", marginBottom: "0.75rem" }}>AI-Powered Analysis</h4>
                    <p className="leading-relaxed mb-0" style={{ color: "#475569", fontSize: "1.05rem" }}>
                      Our advanced artificial intelligence algorithms process your information in real-time. By cross-referencing your symptoms with vast medical databases, the AI identifies potential concerns and generates a preliminary health assessment with high precision.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden" style={{ height: "260px", borderRadius: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop" alt="Medical professional analyzing data" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "3rem" }}>
                <div className="flex gap-6 relative h-full">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="rounded-full text-white flex items-center justify-center text-xl font-semibold z-10" style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#00df81" }}>
                      03
                    </div>
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <h4 className="text-2xl font-semibold mt-0" style={{ color: "#163321", marginBottom: "0.75rem" }}>Specialist Assignment</h4>
                    <p className="leading-relaxed mb-0" style={{ color: "#475569", fontSize: "1.05rem" }}>
                      Based on the AI's diagnostic insights, our system automatically matches you with the most qualified doctor for your specific needs. You'll receive a personalized care plan and direct access to your dedicated healthcare professional.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden" style={{ height: "260px", borderRadius: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop" alt="Patient and specialist matching" className="w-full h-full object-cover" />
                </div>
              </div>

            </div>
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
