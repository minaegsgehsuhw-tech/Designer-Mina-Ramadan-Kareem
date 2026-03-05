import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Settings, RefreshCw, Plus, Minus, ShieldCheck, X } from 'lucide-react';

interface PrizeStatus {
  prize_name: string;
  current_count: number;
  max_limit: number;
}

interface Offer {
  id: number;
  phone: string;
  programs: string;
  discount_code: string;
  created_at: string;
}

interface ContestEntry {
  id: number;
  phone: string;
  image_data: string;
  created_at: string;
}

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prizes, setPrizes] = useState<PrizeStatus[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [contest, setContest] = useState<ContestEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'offers' | 'contest'>('prizes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeLimit, setNewPrizeLimit] = useState(10);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'a52s') {
      setIsAuthenticated(true);
      fetchStatus();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/all-data?password=${password}`);
      const data = await res.json();
      if (res.ok) {
        setPrizes(data.prizes);
        setOffers(data.offers);
        setContest(data.contest);
      } else {
        setError(data.error || 'فشل في جلب البيانات');
      }
    } catch (err) {
      setError('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const addPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeName) return;
    try {
      const res = await fetch('/api/admin/add-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prizeName: newPrizeName, limit: newPrizeLimit })
      });
      if (res.ok) {
        setNewPrizeName('');
        fetchStatus();
      } else {
        const data = await res.json();
        setError(data.error || 'فشل في إضافة الاشتراك');
      }
    } catch (err) {
      setError('فشل في إضافة الاشتراك');
    }
  };

  const deletePrize = async (prizeName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف اشتراك "${prizeName}" نهائياً؟`)) return;
    try {
      await fetch('/api/admin/delete-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prizeName })
      });
      fetchStatus();
    } catch (err) {
      setError('فشل في حذف الاشتراك');
    }
  };

  const deleteOffer = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await fetch('/api/admin/delete-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
      });
      fetchStatus();
    } catch (err) {
      setError('فشل في حذف الطلب');
    }
  };

  const deleteContest = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المشاركة؟')) return;
    try {
      await fetch('/api/admin/delete-contest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
      });
      fetchStatus();
    } catch (err) {
      setError('فشل في حذف المشاركة');
    }
  };

  const updateLimit = async (prizeName: string, newLimit: number) => {
    try {
      await fetch('/api/admin/update-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prizeName, newLimit })
      });
      fetchStatus();
    } catch (err) {
      setError('فشل في تحديث الحد');
    }
  };

  const resetCount = async (prizeName: string) => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين عدد السحوبات لهذا الاشتراك؟')) return;
    try {
      await fetch('/api/admin/reset-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prizeName })
      });
      fetchStatus();
    } catch (err) {
      setError('فشل في إعادة التعيين');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ramadan-card border-ramadan-gold/50 text-center"
        >
          <div className="w-16 h-16 bg-ramadan-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-ramadan-gold" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-6">خاص بمسؤولي الموقع</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="ramadan-input text-center"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="ramadan-button w-full">
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold text-ramadan-gold flex items-center gap-3">
          <ShieldCheck size={32} /> لوحة تحكم المسؤولين
        </h2>
        <button 
          onClick={fetchStatus}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="تحديث"
        >
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('prizes')}
          className={`px-6 py-2 rounded-full transition-all ${activeTab === 'prizes' ? 'bg-ramadan-gold text-ramadan-dark font-bold' : 'bg-white/5 hover:bg-white/10'}`}
        >
          الجوائز والاشتراكات
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-6 py-2 rounded-full transition-all ${activeTab === 'offers' ? 'bg-ramadan-gold text-ramadan-dark font-bold' : 'bg-white/5 hover:bg-white/10'}`}
        >
          طلبات العروض ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('contest')}
          className={`px-6 py-2 rounded-full transition-all ${activeTab === 'contest' ? 'bg-ramadan-gold text-ramadan-dark font-bold' : 'bg-white/5 hover:bg-white/10'}`}
        >
          مشاركات المسابقة ({contest.length})
        </button>
      </div>

      {activeTab === 'prizes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-10 ramadan-card border-ramadan-gold/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} /> إضافة نوع اشتراك جديد
            </h3>
            <form onSubmit={addPrize} className="flex flex-wrap gap-4">
              <input
                type="text"
                value={newPrizeName}
                onChange={(e) => setNewPrizeName(e.target.value)}
                placeholder="اسم الاشتراك (مثلاً: netflix)"
                className="ramadan-input flex-1 min-w-[200px]"
              />
              <input
                type="number"
                value={newPrizeLimit}
                onChange={(e) => setNewPrizeLimit(parseInt(e.target.value))}
                placeholder="العدد المتاح"
                className="ramadan-input w-32"
              />
              <button type="submit" className="ramadan-button">
                إضافة
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prizes.map((p) => (
              <div key={p.prize_name} className="ramadan-card border-white/10 relative group">
                <button 
                  onClick={() => deletePrize(p.prize_name)}
                  className="absolute top-2 left-2 p-1 text-red-500 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                  title="حذف هذا النوع"
                >
                  <X size={16} />
                </button>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold capitalize">
                    {p.prize_name === 'capcut' ? 'كاب كات' : p.prize_name === 'office' ? 'أوفيس 365' : p.prize_name}
                  </h3>
                  <Settings className="opacity-30" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-xs opacity-50 mb-1">حسابات انسحبت</p>
                    <p className="text-3xl font-bold text-ramadan-gold">{p.current_count}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-xs opacity-50 mb-1">إجمالي الحسابات</p>
                    <p className="text-3xl font-bold text-blue-400">{p.max_limit}</p>
                  </div>
                </div>

                <div className="bg-green-500/10 p-3 rounded-lg text-center mb-6">
                  <p className="text-sm text-green-500 font-bold">
                    المتبقي حالياً: {Math.max(0, p.max_limit - p.current_count)} حساب
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span className="text-sm">الحد الأقصى: {p.max_limit}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateLimit(p.prize_name, p.max_limit - 1)}
                        className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-500"
                      >
                        <Minus size={16} />
                      </button>
                      <button 
                        onClick={() => updateLimit(p.prize_name, p.max_limit + 1)}
                        className="p-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-500"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => resetCount(p.prize_name)}
                    className="w-full py-2 text-xs opacity-30 hover:opacity-100 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} /> إعادة تعيين عدد السحوبات
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'offers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-20 opacity-30">لا توجد طلبات عروض بعد</div>
          ) : (
            offers.map((o) => (
              <div key={o.id} className="ramadan-card border-white/10 flex flex-col md:flex-row justify-between gap-4 relative group">
                <button 
                  onClick={() => deleteOffer(o.id)}
                  className="absolute top-2 left-2 p-1 text-red-500 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div>
                  <p className="text-ramadan-gold font-bold mb-1">{o.phone}</p>
                  <p className="text-sm opacity-70">البرامج: {o.programs}</p>
                  {o.discount_code && <p className="text-xs text-green-500 mt-1">كود الخصم: {o.discount_code}</p>}
                </div>
                <div className="text-left">
                  <p className="text-xs opacity-30">{new Date(o.created_at).toLocaleString('ar-EG')}</p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'contest' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contest.length === 0 ? (
            <div className="col-span-full text-center py-20 opacity-30">لا توجد مشاركات في المسابقة بعد</div>
          ) : (
            contest.map((c) => (
              <div key={c.id} className="ramadan-card border-white/10 relative group">
                <button 
                  onClick={() => deleteContest(c.id)}
                  className="absolute top-2 left-2 p-1 text-red-500 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <img 
                  src={c.image_data} 
                  alt="Design" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  referrerPolicy="no-referrer"
                />
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-ramadan-gold font-bold">{c.phone}</p>
                    <p className="text-xs opacity-30">{new Date(c.created_at).toLocaleString('ar-EG')}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = c.image_data;
                      link.download = `design-${c.phone}.png`;
                      link.click();
                    }}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    تحميل الصورة
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      <div className="mt-12 text-center opacity-30 text-sm">
        <p>هذا القسم خاص بمسؤولي الموقع فقط</p>
      </div>
    </div>
  );
}
