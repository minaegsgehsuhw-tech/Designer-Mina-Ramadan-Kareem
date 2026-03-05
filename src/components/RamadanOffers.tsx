import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Phone, Send, CheckCircle, X } from 'lucide-react';
import emailjs from 'emailjs-com';

const OFFERS = [
  { id: 'adobe', name: 'ادوبي كولكشن' },
  { id: 'office', name: 'اوفيس 365' },
  { id: 'windows', name: 'ويندوز 10/11 برو' },
  { id: 'canva', name: 'كانفا برو' },
  { id: 'chatgpt', name: 'شات جي بي تي +' },
  { id: 'midjourney', name: 'ميدجورني' },
  { id: 'netflix', name: 'نتفليكس' },
  { id: 'spotify', name: 'سبوتيفاي' },
  { id: 'youtube', name: 'يوتيوب بريميوم' },
  { id: 'freepik', name: 'فري بيك' },
  { id: 'capcut', name: 'كب كت برو' },
  { id: 'linkedin', name: 'لينكد إن بريميوم' },
  { id: 'grammarly', name: 'جرامرلي' },
  { id: 'duolingo', name: 'دولينجو بلس' },
  { id: 'vpn', name: 'VPN (Nord/Express)' },
  { id: 'antivirus', name: 'انتي فيرس (Kaspersky)' },
];

export default function RamadanOffers() {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleOffer = (name: string) => {
    setSelectedOffers(prev => 
      prev.includes(name) ? prev.filter(o => o !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOffers.length === 0 || !phone) return;
    setIsSubmitting(true);

    try {
      const result = await emailjs.send(
        'service_2zi1i8v',
        'template_ycwdam7',
        {
          message: `طلب عرض رمضان:\nالبرامج: ${selectedOffers.join(', ')}\nرقم الهاتف: ${phone}\nكود الخصم: ${discountCode || 'لا يوجد'}`,
          program: selectedOffers.join(', '),
          phone: phone,
          discount_code: discountCode || 'لا يوجد',
        },
        'Ahy3hTsRhql3F-bvj'
      );
      console.log('EmailJS Success:', result.text);
      setSubmitted(true);
      setShowOrderForm(false);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitted(true);
      setShowOrderForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-ramadan-gold mb-4">عروض رمضان</h2>
        <div className="inline-block bg-ramadan-gold/20 text-ramadan-gold px-4 py-2 rounded-full font-bold text-lg md:text-xl border border-ramadan-gold/30">
          خصم 70% علي اشتركات سعر خاص
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-12">
        {OFFERS.map((offer) => (
          <motion.div
            key={offer.id}
            whileHover={{ y: -5 }}
            className={`ramadan-card border-2 transition-all cursor-pointer p-4 ${
              selectedOffers.includes(offer.name) ? 'border-ramadan-gold bg-ramadan-gold/10' : 'border-white/10'
            }`}
            onClick={() => toggleOffer(offer.name)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg md:text-2xl font-bold">{offer.name}</h3>
              <ShoppingCart size={20} className={selectedOffers.includes(offer.name) ? 'text-ramadan-gold' : 'opacity-30'} />
            </div>
            <button
              className={`w-full py-1.5 md:py-2 rounded-lg font-bold text-sm md:text-base transition-colors ${
                selectedOffers.includes(offer.name) ? 'bg-ramadan-gold text-ramadan-blue' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {selectedOffers.includes(offer.name) ? 'تم الاختيار' : 'اطلب الان'}
            </button>
          </motion.div>
        ))}
      </div>

      {selectedOffers.length > 0 && !submitted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
          <button
            onClick={() => setShowOrderForm(true)}
            className="ramadan-button w-full shadow-2xl shadow-ramadan-gold/40 flex items-center justify-center gap-2 text-lg"
          >
            إتمام الطلب ({selectedOffers.length}) <Send size={20} />
          </button>
        </div>
      )}

      {/* Order Form Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="ramadan-card w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowOrderForm(false)}
                className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-6 text-center text-ramadan-gold">إتمام الطلب</h3>
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs opacity-50 mb-1">البرامج المختارة:</p>
                <p className="text-sm font-bold">{selectedOffers.join(' - ')}</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm opacity-70 mb-2 text-right">رقم الهاتف (يوجد به واتساب)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="ramadan-input w-full text-right"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm opacity-70 mb-2 text-right">كود الخصم (اختياري)</label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="ramadan-input w-full text-right"
                    placeholder="ادخل الكود هنا"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ramadan-button w-full mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'جاري الارسال...' : (
                    <>
                      تأكيد الطلب <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ramadan-card w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={40} className="text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">تم استلام طلبك!</h2>
              <p className="text-lg opacity-80 mb-6">سيتم التواصل معك خلال ٢٤ ساعة</p>
              <div className="ramadan-card border-ramadan-gold/30 w-full mb-6">
                <p className="opacity-70 mb-2 text-sm">في حالة تاخير التواصل معك تواصل معنا</p>
                <a href="tel:01208228270" className="text-xl md:text-2xl font-bold text-ramadan-gold flex items-center justify-center gap-2">
                  <Phone size={24} /> 01208228270
                </a>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="ramadan-button w-full"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
