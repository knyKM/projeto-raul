import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustBadges from "@/components/landing/TrustBadges";
import Benefits from "@/components/landing/Benefits";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTABanner from "@/components/landing/CTABanner";
import ContactForm from "@/components/landing/ContactForm";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <TrustBadges />
      <Benefits />
      <StatsBar />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <ContactForm />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
