import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const goToDashboard = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
    else if (role === 'staff') navigate('/staff');
    else navigate('/patient');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white scroll-smooth">
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-lg shadow-sky-200 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">local_hospital</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">MediCare</span>
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-semibold leading-6 text-slate-600 hover:text-sky-600 transition-colors">Home</button>
            <button onClick={() => scrollToSection('booking')} className="text-sm font-semibold leading-6 text-slate-600 hover:text-sky-600 transition-colors">Appointments</button>
            <button onClick={() => scrollToSection('services')} className="text-sm font-semibold leading-6 text-slate-600 hover:text-sky-600 transition-colors">Service</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-semibold leading-6 text-slate-600 hover:text-sky-600 transition-colors">Contact</button>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={goToDashboard}
                  className="flex items-center gap-2 text-sm font-semibold leading-6 text-slate-700 hover:text-sky-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            ) : (
              <a href="/login" className="text-sm font-semibold leading-6 text-white bg-sky-600 px-6 py-2.5 rounded-full hover:bg-sky-700 transition-all shadow-md shadow-sky-100 flex items-center gap-1">
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </div>
        </nav>
      </header>

      <main className="pt-20">
        {/* About Us / Hero Section */}
        <section id="about" className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden bg-slate-50">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80d4ff] to-[#0077c2] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          <div className="mx-auto max-w-7xl py-24 sm:py-32 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-sm font-bold tracking-wide uppercase mb-6">About Our Clinic</span>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                Your Health is Our <span className="text-sky-600">Top Priority</span>
              </h1>
              <p className="text-lg leading-8 text-slate-600 mb-10 max-w-xl">
                MediCare is a state-of-the-art medical facility dedicated to providing comprehensive and compassionate healthcare services. Our team of expert doctors and staff are committed to your well-being.
              </p>
              <div className="flex items-center gap-x-6">
                <button
                  onClick={() => scrollToSection('booking')}
                  className="rounded-2xl bg-sky-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-sky-200 hover:bg-sky-500 transition-all hover:-translate-y-1"
                >
                  Learn More About Us
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                  alt="Modern Clinic"
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl hidden lg:block border border-slate-100 max-w-xs animate-bounce-slow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Certified Experts</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Highly qualified specialists across all medical fields ready to serve you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-r from-sky-600 to-sky-800 rounded-[40px] px-8 py-16 sm:px-16 sm:py-24 text-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
                  Ready to Book Your Appointment?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-sky-100 mb-12">
                  Take the first step towards a healthier life. Our seamless online booking system allows you to schedule a consultation with your preferred doctor in seconds.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <a
                    href="/login"
                    className="rounded-2xl bg-white px-10 py-5 text-lg font-bold text-sky-700 shadow-xl hover:bg-sky-50 transition-all hover:-translate-y-1 block sm:inline-block"
                  >
                    Book Now
                  </a>
                  <p className="text-sm font-medium text-sky-200">
                    <span className="material-symbols-outlined align-middle mr-1 text-white">bolt</span>
                    Quick & Secure Booking Process
                  </p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20">
                <div className="aspect-square w-[500px] rounded-full bg-white"></div>
              </div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 blur-3xl opacity-20">
                <div className="aspect-square w-[500px] rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Services Section */}
        <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <span className="text-sky-600 font-bold uppercase tracking-widest text-sm mb-4 block">What We Offer</span>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">Our Medical Services</h2>
              <div className="w-20 h-1.5 bg-sky-600 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'General Consultation', icon: 'medical_services', desc: 'Routine check-ups and primary care for all age groups with expert general practitioners.' },
                { title: 'Specialized Surgery', icon: 'surgical', desc: 'Advanced surgical procedures performed by highly skilled surgeons in world-class facilities.' },
                { title: 'Laboratory Tests', icon: 'biotech', desc: 'Comprehensive diagnostic services with rapid and accurate results from our modern lab.' },
                { title: 'Dental Care', icon: 'dentistry', desc: 'Complete oral health services from routine cleaning to advanced restorative dentistry.' },
                { title: 'Emergency Care', icon: 'emergency', desc: '24/7 emergency medical assistance with dedicated trauma and urgent care units.' },
                { title: 'Pharmacy Services', icon: 'pill', desc: 'Full-service on-site pharmacy providing authentic medications and expert consultations.' },
              ].map((service, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                  <div className="size-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-8 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-sky-600 transition-colors uppercase tracking-tight">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Contact Us Section */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 border-b border-slate-800 pb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="size-10 rounded-xl bg-sky-600 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">MediCare</span>
              </div>
              <p className="text-lg text-slate-400 mb-8 max-w-md leading-relaxed">
                Leading the way in medical excellence. We provide high-quality healthcare services with a focus on patient comfort and recovered.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map(s => (
                  <a key={s} href="#" className="size-12 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-sky-600 transition-all text-white border border-slate-700">
                    <span className="material-symbols-outlined text-[20px]">{s === 'facebook' ? 'public' : s === 'twitter' ? 'chat' : s === 'linkedin' ? 'group' : 'photo_camera'}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-sm">Quick Links</h4>
              <ul className="space-y-4 font-medium">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-sky-500 transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-sky-500 transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-sky-500 transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('booking')} className="hover:text-sky-500 transition-colors">Book Now</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-sm">Contact Us</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-sky-500">location_on</span>
                  <div>
                    <p className="text-white font-bold mb-1">Our Location</p>
                    <p className="text-sm text-slate-400">123 Health Ave, Medical District<br />Colombo 00700, Sri Lanka</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-sky-500">call</span>
                  <div>
                    <p className="text-white font-bold mb-1">Phone Number</p>
                    <p className="text-sm text-slate-400">+94 11 234 5678<br />+94 11 876 5432</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-sky-500">mail</span>
                  <div>
                    <p className="text-white font-bold mb-1">Email Address</p>
                    <p className="text-sm text-slate-400">contact@medicare.com<br />support@medicare.com</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 text-center text-sm font-medium text-slate-500">
            <p>&copy; {new Date().getFullYear()} MediCare Clinic. All rights reserved. Designed for excellence in healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}