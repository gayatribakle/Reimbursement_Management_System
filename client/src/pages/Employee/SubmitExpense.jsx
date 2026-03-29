import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, DollarSign, Calendar, FileText, Loader2, ArrowRightLeft, Scan, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSubmitExpense } from '../../hooks/useExpenses';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/axios';

const CATEGORIES = [
  'TRAVEL', 'FOOD', 'ACCOMMODATION', 'OFFICE_SUPPLIES', 'MEDICAL',
  'TRAINING', 'ENTERTAINMENT', 'UTILITIES', 'OTHER',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export default function SubmitExpense() {
  const navigate = useNavigate();
  const company = useAuthStore((s) => s.company);
  const companyCurrency = company?.currency || 'USD';
  const { mutate: submit, isPending } = useSubmitExpense();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    amount: '',
    originalCurrency: companyCurrency,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'amount' || field === 'originalCurrency') {
      fetchRate(
        field === 'originalCurrency' ? value : form.originalCurrency,
        companyCurrency,
        field === 'amount' ? parseFloat(value) : parseFloat(form.amount)
      );
    }
  };

  const fetchRate = async (from, to, amount) => {
    if (!from || !to || !amount || from === to) {
      setConvertedAmount(amount ? amount.toFixed(2) : null);
      setExchangeRate(from === to ? 1 : null);
      return;
    }
    try {
      const res = await api.get(`/expenses/rate?from=${from}&to=${to}`);
      const rate = res.data?.rate || 1;
      setExchangeRate(rate);
      setConvertedAmount((amount * rate).toFixed(2));
    } catch {
      setExchangeRate(1);
      setConvertedAmount(amount.toFixed(2));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setScanResult(null);
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    try {
      const fd = new FormData();
      fd.append('receipt', file);
      const res = await api.post('/expenses/ocr-scan', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;
      if (data.success) {
        setScanResult(data);
        if (data.amount) handleChange('amount', String(data.amount));
        if (data.description) handleChange('description', data.description);
        if (data.date) handleChange('date', data.date);
      }
    } catch {
      setScanResult({ error: true });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('amount', form.amount);
    formData.append('originalCurrency', form.originalCurrency);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('date', form.date);
    if (file) formData.append('receipt', file);

    submit(formData, {
      onSuccess: () => navigate('/employee/expenses'),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Submit Expense</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Upload a receipt and fill in the details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Receipt Upload */}
        <div className="card-elevated space-y-4">
          <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Receipt
          </h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/50 transition-all"
          >
            <Upload className="w-8 h-8 text-outline mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">
              Drag & drop or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-outline mt-1">JPEG, PNG up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {preview && (
            <div className="relative rounded-xl overflow-hidden bg-surface-container-low">
              <img src={preview} alt="Receipt" className="w-full max-h-52 object-contain" />
            </div>
          )}

          {file && (
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" /> 🔍 Scan with OCR
                </>
              )}
            </button>
          )}

          {scanResult && !scanResult.error && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-800 font-medium">Fields auto-filled!</p>
            </div>
          )}
          {scanResult?.error && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">Could not read receipt. Fill manually.</p>
            </div>
          )}
        </div>

        {/* Expense Details */}
        <div className="card-elevated space-y-4">
          <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="input-elevated pl-9"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Currency</label>
              <select
                value={form.originalCurrency}
                onChange={(e) => handleChange('originalCurrency', e.target.value)}
                className="select-elevated"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.originalCurrency !== companyCurrency &&
            form.amount &&
            convertedAmount && (
              <div className="flex items-center gap-2 p-3 bg-primary/8 rounded-xl">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                <p className="text-sm text-on-surface">
                  <span className="font-medium">
                    {form.originalCurrency} {parseFloat(form.amount).toFixed(2)}
                  </span>
                  {' ≈ '}
                  <span className="font-bold text-primary">
                    {companyCurrency} {convertedAmount}
                  </span>
                  <span className="text-xs text-on-surface-variant ml-2">
                    (Rate: {exchangeRate?.toFixed(4)})
                  </span>
                </p>
              </div>
            )}

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="select-elevated"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input-elevated pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-elevated resize-none min-h-[80px]"
              placeholder="Describe the expense..."
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/employee/expenses')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              'Submit Expense'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
