import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Settings, RefreshCw, Plus, Minus, ShieldCheck, X } from 'lucide-react';

interface PrizeStatus {
  prize_name: string;
  current_count: number;
  max_limit: number;
}

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prizes, setPrizes] = useState<PrizeStatus[]>([]);
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
      const res = await fetch('/api/prize-status');
      const data = await res.json();
      setPrizes(data);
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

      <div className="mt-12 text-center opacity-30 text-sm">
        <p>هذا القسم خاص بمسؤولي الموقع فقط</p>
      </div>
    </div>
  );
}
