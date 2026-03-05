import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Send, CheckCircle } from 'lucide-react';
import emailjs from 'emailjs-com';

export default function DesignContest() {
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !image) return;
    setIsSubmitting(true);

    try {
      await emailjs.send(
        'fU2dnpaHIDYKOww954ig',
        'template_contest',
        {
          phone: phone,
          design_image: image, // Note: EmailJS has limits on attachment size, usually better to send a link or small base64
        },
        'Ahy3hTsRhql3F-bvj'
      );
      setSubmitted(true);
    } catch (error) {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">تم استلام تصميمك بنجاح!</h2>
        <p className="text-xl opacity-80">يوم ٣٠ رمضان سيتم التواصل مع الفائزين</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-ramadan-gold mb-6">مسابقة التصميم</h2>
        <div className="ramadan-card border-ramadan-gold/30 mb-8">
          <p className="text-lg leading-relaxed">
            هذا الصفحة اضع فيها افضل تصميم عندك
            <br />
            و٣ أشخاص فقط هيكسبوا هنتواصل معهم
            <br />
            وهيختاروا اي اشترك مجاني هدية ليهم
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ramadan-card flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <label className="w-full h-64 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-ramadan-gold transition-colors overflow-hidden relative">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload size={48} className="text-white/30 mb-2" />
                <span className="opacity-50">اضغط لرفع تصميمك</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
          </label>
        </div>

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
          disabled={isSubmitting || !image}
          className="ramadan-button w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'جاري الارسال...' : (
            <>
              ارسال التصميم <Send size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
