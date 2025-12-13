import type { MouseEvent } from "react";
import { Link } from "wouter";
import { Sun, Sunrise, Moon, Clock, Search, BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from '@assets/logo-social_1765305531532.png';
import { useAuth } from "@/lib/auth";
import { generatePrayerSummaryMessage } from "@/lib/attendanceStore";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Home() {
  const { toggleAdmin, isAdmin } = useAuth();

  const shareOnWhatsApp = (prayerType: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = generatePrayerSummaryMessage(prayerType);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const prayers = [
    { id: 'Fajr', label: 'Fajr', sub: 'Before sunrise', icon: Sunrise, time: '05:30 AM' },
    { id: 'Dhuhr', label: 'Dhuhr', sub: 'Midday', icon: Sun, time: '12:30 PM' },
    { id: 'Asr', label: 'Asr', sub: 'Afternoon', icon: Clock, time: '04:15 PM' },
  ];

  const eveningPrayers = [
    { id: 'Maghrib', label: 'Maghrib', sub: 'Sunset', icon: Moon, time: '06:45 PM' },
    { id: 'Isha', label: 'Isha', sub: 'Night', icon: Moon, time: '08:00 PM' },
  ];

  return (
    <div className={`min-h-screen pb-8 transition-colors duration-500 ${isAdmin ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-emerald-400 to-emerald-600'}`}>
      {/* Header Section */}
      <div className="pt-12 pb-6 flex flex-col items-center justify-center space-y-4 text-white">
        <button 
          onClick={toggleAdmin}
          className="bg-white/90 p-3 rounded-3xl shadow-lg backdrop-blur-sm active:scale-90 transition-transform cursor-pointer"
        >
          <img src={logo} alt="Caliph Logo" className="w-16 h-16 object-contain" />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading drop-shadow-sm">
            Caliph Attendance
          </h1>
          {isAdmin && <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium tracking-wide">ADMIN MODE</span>}
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 space-y-6"
      >
        {/* Daily Prayers Section */}
        <div className="space-y-3">
          <div className={`flex items-center justify-center space-x-2 font-medium ${isAdmin ? 'text-slate-300' : 'text-emerald-50'}`}>
            <Search className="w-4 h-4" />
            <span>Daily Prayers</span>
          </div>

          {/* Top Row: Fajr, Dhuhr, Asr */}
          <div className="grid grid-cols-3 gap-3">
            {prayers.map((prayer) => (
              <motion.div key={prayer.id} variants={item} className="relative">
                <Link href={`/select-class/${prayer.id}`} className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 h-32 shadow-sm active:scale-95 transition-transform block">
                    <div className={isAdmin ? "text-slate-700" : "text-emerald-600"}>
                      <prayer.icon size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm leading-tight ${isAdmin ? "text-slate-900" : "text-emerald-900"}`}>{prayer.label}</h3>
                      <p className={`text-[10px] font-medium mt-0.5 ${isAdmin ? "text-slate-500" : "text-emerald-600/70"}`}>{prayer.sub}</p>
                    </div>
                </Link>
                <button
                  onClick={(e) => shareOnWhatsApp(prayer.id, e)}
                  className="absolute -top-2 -right-2 p-2 bg-[#25D366] text-white rounded-full shadow-md active:scale-90 transition-transform z-10"
                  title={`Share ${prayer.label} on WhatsApp`}
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Middle Row: Maghrib, Isha */}
          <div className="grid grid-cols-2 gap-3">
            {eveningPrayers.map((prayer) => (
              <motion.div key={prayer.id} variants={item} className="relative">
                <Link href={`/select-class/${prayer.id}`} className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 h-32 shadow-sm active:scale-95 transition-transform block">
                    <div className={isAdmin ? "text-slate-700" : "text-emerald-600"}>
                      <prayer.icon size={32} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isAdmin ? "text-slate-900" : "text-emerald-900"}`}>{prayer.label}</h3>
                      <p className={`text-xs font-medium ${isAdmin ? "text-slate-500" : "text-emerald-600/70"}`}>{prayer.sub}</p>
                    </div>
                </Link>
                <button
                  onClick={(e) => shareOnWhatsApp(prayer.id, e)}
                  className="absolute -top-2 -right-2 p-2 bg-[#25D366] text-white rounded-full shadow-md active:scale-90 transition-transform z-10"
                  title={`Share ${prayer.label} on WhatsApp`}
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Tracking Section */}
        <div className="space-y-3 pt-2">
          <div className={`flex items-center justify-center space-x-2 font-medium ${isAdmin ? 'text-slate-300' : 'text-emerald-50'}`}>
            <BookOpen className="w-4 h-4" />
            <span>Other Tracking</span>
          </div>

          <motion.div variants={item} className="relative">
            <Link href="/select-class/Other" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-md active:scale-95 transition-transform w-full block">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${isAdmin ? "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-300" : "bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-200"}`}>
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className={`font-bold text-xl ${isAdmin ? "text-slate-900" : "text-emerald-950"}`}>Others</h3>
                  <p className={`text-xs font-medium mt-1 ${isAdmin ? "text-slate-500" : "text-emerald-600/60"}`}>Caps, Nails, Uniforms & More</p>
                </div>
            </Link>
            <button
              onClick={(e) => shareOnWhatsApp("Other", e)}
              className="absolute top-2 right-2 p-2 bg-[#25D366] text-white rounded-full shadow-md active:scale-90 transition-transform z-10"
              title="Share Other on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
