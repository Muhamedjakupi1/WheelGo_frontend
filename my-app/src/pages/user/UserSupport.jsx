import React from "react";
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  ChevronRight, 
  HelpCircle, 
  FileText,
  Shield
} from "lucide-react";

export default function TenantUserSupport() {
  return (
    <div style={s.mainContent}>
      <header style={s.header}>
        <h1 style={s.title}>Support Center</h1>
        <p style={s.subtitle}>How can we help you today?</p>
      </header>

      {/* QUICK CONTACT CARDS */}
      <div style={s.contactGrid}>
        <div style={s.contactCard}>
          <div style={{...s.iconCircle, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
            <MessageCircle size={24} />
          </div>
          <h3 style={s.cardTitle}>Live Chat</h3>
          <p style={s.cardDesc}>Chat with our team in real-time.</p>
          <button style={s.actionBtn}>Start Chat</button>
        </div>

        <div style={s.contactCard}>
          <div style={{...s.iconCircle, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
            <Mail size={24} />
          </div>
          <h3 style={s.cardTitle}>Email Us</h3>
          <p style={s.cardDesc}>We'll respond within 24 hours.</p>
          <button style={s.actionBtn}>Send Email</button>
        </div>

        <div style={s.contactCard}>
          <div style={{...s.iconCircle, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
            <Headphones size={24} />
          </div>
          <h3 style={s.cardTitle}>Phone Support</h3>
          <p style={s.cardDesc}>Available Mon-Fri, 9am-6pm.</p>
          <button style={s.actionBtn}>Call Now</button>
        </div>
      </div>

      <div style={s.contentGrid}>
        {/* FAQ SECTION */}
        <section style={s.cardSection}>
          <h2 style={s.sectionTitle}>Frequently Asked Questions</h2>
          <div style={s.faqList}>
            <FaqItem question="How do I change my booking dates?" />
            <FaqItem question="What is your fuel policy?" />
            <FaqItem question="Is insurance included in the price?" />
            <FaqItem question="Can I cancel my reservation?" />
          </div>
        </section>

        {/* DOCUMENTATION SECTION */}
        <section style={s.cardSection}>
          <h2 style={s.sectionTitle}>Legal & Documentation</h2>
          <div style={s.docList}>
            <DocItem icon={<FileText size={18}/>} title="Rental Agreement" />
            <DocItem icon={<Shield size={18}/>} title="Privacy Policy" />
            <DocItem icon={<HelpCircle size={18}/>} title="Terms of Service" />
          </div>
        </section>
      </div>
    </div>
  );
}

const FaqItem = ({ question }) => (
  <div style={s.faqItem}>
    <span>{question}</span>
    <ChevronRight size={18} color="#64748b" />
  </div>
);

const DocItem = ({ icon, title }) => (
  <div style={s.docItem}>
    <div style={s.docLeft}>
      {icon}
      <span style={{marginLeft: 12}}>{title}</span>
    </div>
    <button style={s.downloadBtn}>View</button>
  </div>
);

const s = {
  mainContent: { width: "100%", color: "#fff" },
  header: { marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "700", margin: "0 0 10px 0" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px", marginBottom: "40px" },
  contactCard: { 
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: "24px", 
    padding: "30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" 
  },
  iconCircle: { width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "10px" },
  cardDesc: { color: "#64748b", fontSize: "14px", marginBottom: "20px" },
  actionBtn: { 
    width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid #334155", 
    background: "transparent", color: "#fff", cursor: "pointer", fontWeight: "600", transition: "0.2s" 
  },
  contentGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" },
  cardSection: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "24px", padding: "30px" },
  sectionTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "25px" },
  faqList: { display: "flex", flexDirection: "column", gap: "10px" },
  faqItem: { 
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", 
    background: "#161f2e", borderRadius: "16px", cursor: "pointer", border: "1px solid transparent"
  },
  docList: { display: "flex", flexDirection: "column", gap: "15px" },
  docItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" },
  docLeft: { display: "flex", alignItems: "center", color: "#94a3b8" },
  downloadBtn: { background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer" }
};
