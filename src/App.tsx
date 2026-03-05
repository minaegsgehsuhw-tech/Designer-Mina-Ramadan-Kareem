import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Gift, Image as ImageIcon, ShoppingBag, Home, Phone, ShieldCheck } from 'lucide-react';
import { generateRandomCode } from './lib/utils';
import LuckGame from './components/LuckGame';
import DesignContest from './components/DesignContest';
import RamadanOffers from './components/RamadanOffers';
import AdminPanel from './components/AdminPanel';
import emailjs from 'emailjs-com';

// Initialize EmailJS
emailjs.init('Ahy3hTsRhql3F-bvj');

type Page = 'home' | 'contest' | 'offers' | 'admin';

export default function App() {
  const [userCode, setUserCode] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const savedCode = localStorage.getItem('ramadan_user_code');
    if (savedCode) {
      setUserCode(savedCode);
    } else {
      const newCode = generateRandomCode();
      setUserCode(newCode);
      localStorage.setItem('ramadan_user_code', newCode);
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 p-6 z-50">
        <button 
          onClick={toggleMenu}
          className="p-2 bg-ramadan-gold/20 backdrop-blur-md rounded-lg border border-ramadan-gold/30 text-ramadan-gold hover:bg-ramadan-gold/40 transition-colors"
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-ramadan-blue/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8"
          >
            <button onClick={() => navigate('home')} className="flex items-center gap-3 text-2xl font-bold hover:text-ramadan-gold transition-colors">
              <Home /> الرئيسية
            </button>
            <button onClick={() => navigate('contest')} className="flex items-center gap-3 text-2xl font-bold hover:text-ramadan-gold transition-colors">
              <ImageIcon /> مسابقة التصميم
            </button>
            <button onClick={() => navigate('offers')} className="flex items-center gap-3 text-2xl font-bold hover:text-ramadan-gold transition-colors">
              <ShoppingBag /> عروض رمضان
            </button>
            <button onClick={() => navigate('admin')} className="flex items-center gap-3 text-2xl font-bold hover:text-ramadan-gold transition-colors opacity-20 hover:opacity-100">
              <ShieldCheck /> لوحة التحكم
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-16 md:pt-24 pb-12">
        <div className="flex flex-col items-center text-center mb-6 md:mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 md:w-24 md:h-24 bg-ramadan-gold rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-2xl shadow-ramadan-gold/20"
          >
            <Gift size={32} className="text-ramadan-blue md:size-12" />
          </motion.div>
          <h1 className="text-3xl md:text-6xl font-bold mb-2 md:mb-4 text-ramadan-gold">رمضان كريم</h1>
          <div className="ramadan-card inline-block py-2 px-4 md:py-4 md:px-6">
            <p className="text-xs opacity-70 mb-1">هذا كود خاص بيك</p>
            <p className="text-xl md:text-3xl font-mono font-bold tracking-widest text-ramadan-gold">{userCode}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LuckGame userCode={userCode} />
            </motion.div>
          )}
          {currentPage === 'contest' && (
            <motion.div
              key="contest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DesignContest />
            </motion.div>
          )}
          {currentPage === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RamadanOffers />
            </motion.div>
          )}
          {currentPage === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-ramadan-gold rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-ramadan-purple rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
