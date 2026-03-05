import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Gift, Send, CheckCircle, X } from 'lucide-react';
import emailjs from 'emailjs-com';

const ITEMS = [
  { id: 'adobe', name: 'ادوبي', canWin: false },
  { id: 'freepik', name: 'فري بيك', canWin: false },
  { id: 'capcut', name: 'كاب كات', canWin: true },
  { id: 'office', name: 'اوفيس', canWin: true },
  { id: 'microsoft', name: 'ميكرسوفت', canWin: false },
  { id: 'special', name: 'ادوات مميزة', canWin: false },
  { id: 'discounts', name: 'اكواد خصم', canWin: true },
];

interface LuckGameProps {
  userCode: string;
}

export default function LuckGame({ userCode }: LuckGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [prize, setPrize] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    const savedPrize = localStorage.getItem('ramadan_prize');
    const savedMessage = localStorage.getItem('ramadan_claim_status');
    if (savedPrize) {
      setPrize(savedPrize);
    }
    if (savedMessage) {
      setMessage(savedMessage);
      setHasClaimed(true);
    }
  }, []);

  const startSpin = async () => {
    if (isSpinning || prize) return;
    setIsSpinning(true);
    
    let finalPrize = 'discount_10'; // Default fallback
    
    // Call API to determine prize based on limits
    try {
      const response = await fetch('/api/claim-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizeType: Math.random() > 0.5 ? 'capcut' : 'office' })
      });
      
      if (response.ok) {
        const data = await response.json();
        finalPrize = data.prize;
        console.log('Prize selected from server:', finalPrize);
      }
    } catch (error) {
      console.error('Prize API error:', error);
      // Continue with fallback
    }

    let currentIdx = 0;
    const spins = 30 + Math.floor(Math.random() * 10);
    
    const interval = setInterval(() => {
      setActiveIndex(currentIdx % ITEMS.length);
      currentIdx++;
      
      if (currentIdx >= spins) {
        clearInterval(interval);
        
        // Find index of the prize to stop on
        let targetIdx = -1;
        if (finalPrize === 'capcut') targetIdx = ITEMS.findIndex(i => i.id === 'capcut');
        else if (finalPrize === 'office') targetIdx = ITEMS.findIndex(i => i.id === 'office');
        else targetIdx = ITEMS.findIndex(i => i.id === 'discounts');

        setActiveIndex(targetIdx);
        setIsSpinning(false);
        
        let prizeName = '';
        if (finalPrize === 'capcut') prizeName = 'اشتراك كاب كات مجاني';
        else if (finalPrize === 'office') prizeName = 'اشتراك اوفيس مجاني';
        else if (finalPrize.startsWith('discount_')) {
          const discountVal = finalPrize.split('_')[1];
          prizeName = `كود خصم ${discountVal}%`;
        } else {
          // For any other custom prize added via admin panel
          prizeName = `اشتراك ${finalPrize} مجاني`;
        }

        setPrize(prizeName);
        localStorage.setItem('ramadan_prize', prizeName);
        setShowPrizeModal(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F59E0B', '#FFFFFF']
        });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);

    try {
      const result = await emailjs.send(
        'service_2zi1i8v',
        'template_ycwdam7',
        {
          message: `فوز بجائزة: ${prize}\nكود المستخدم: ${userCode}\nرقم الهاتف: ${phone}`,
          user_code: userCode,
          prize: prize,
          phone: phone,
        },
        'Ahy3hTsRhql3F-bvj'
      );
      console.log('EmailJS Success:', result.text);
      setMessage('سيتم مراجعة هديتك وسنتواصل معك ونسلمك الهدية');
      localStorage.setItem('ramadan_claim_status', 'سيتم مراجعة هديتك وسنتواصل معك ونسلمك الهدية');
      setHasClaimed(true);
      setShowForm(false);
    } catch (error) {
      console.error('EmailJS Error:', error);
      // Still show success to user but log the error
      setMessage('سيتم مراجعة هديتك وسنتواصل معك ونسلمك الهدية');
      localStorage.setItem('ramadan_claim_status', 'سيتم مراجعة هديتك وسنتواصل معك ونسلمك الهدية');
      setHasClaimed(true);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mb-6">
        {ITEMS.map((item, idx) => (
          <motion.div
            key={item.id}
            animate={{
              scale: activeIndex === idx ? 1.05 : 1,
              backgroundColor: activeIndex === idx ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: activeIndex === idx ? '#D4AF37' : 'rgba(255, 255, 255, 0.1)'
            }}
            className="ramadan-card flex items-center justify-center text-center h-20 md:h-28 p-2 border-2 transition-colors"
          >
            <span className={activeIndex === idx ? 'text-ramadan-gold font-bold text-sm md:text-lg' : 'text-white text-xs md:text-base'}>
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        {!prize && (
          <button
            onClick={startSpin}
            disabled={isSpinning}
            className="ramadan-button text-xl px-12"
          >
            {isSpinning ? 'جاري السحب...' : 'جرب حظك'}
          </button>
        )}

        {prize && !hasClaimed && (
          <div className="text-center animate-in fade-in zoom-in duration-500 ramadan-card border-ramadan-gold/50">
            <h2 className="text-xl mb-2">جائزتك الحالية:</h2>
            <p className="text-3xl font-bold text-ramadan-gold mb-6">{prize}</p>
            <button
              onClick={() => setShowForm(true)}
              className="ramadan-button flex items-center gap-2"
            >
              ارسل لنا لاستلام الجائزة <Send size={20} />
            </button>
          </div>
        )}

        {hasClaimed && message && (
          <div className="ramadan-card bg-green-500/20 border-green-500/50 text-center max-w-md">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-white" />
            </div>
            <p className="text-lg font-bold">{message}</p>
          </div>
        )}
      </div>

      {/* Prize Announcement Modal */}
      {showPrizeModal && prize && !hasClaimed && !showForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ramadan-card w-full max-w-md text-center border-ramadan-gold border-2 relative"
          >
            <button 
              onClick={() => setShowPrizeModal(false)}
              className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-ramadan-gold rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Gift size={40} className="text-ramadan-blue" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 text-white">مبروك! لقد فزت</h2>
            <p className="text-4xl font-bold text-ramadan-gold mb-8">{prize}</p>
            <button
              onClick={() => setShowForm(true)}
              className="ramadan-button w-full flex items-center justify-center gap-2 text-xl"
            >
              ارسل لنا لاستلام الجائزة <Send size={24} />
            </button>
          </motion.div>
        </div>
      )}

      {/* Prize Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ramadan-card w-full max-w-md"
          >
            <h3 className="text-2xl font-bold mb-6 text-ramadan-gold text-center">استلام الجائزة</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm opacity-70 mb-2">رقم الهاتف (يوجد به واتساب)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ramadan-input w-full"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ramadan-button w-full mt-4"
              >
                {isSubmitting ? 'جاري الارسال...' : 'ارسال البيانات'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm opacity-50 hover:opacity-100 transition-opacity"
              >
                إلغاء
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
