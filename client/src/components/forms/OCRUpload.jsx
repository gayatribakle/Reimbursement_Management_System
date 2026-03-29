import { useState, useRef } from 'react';
import { Upload, Scan, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function OCRUpload({ onScanSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const fakeEvent = { target: { files: [dropped] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const { default: api } = await import('../../lib/axios');
      const res = await api.post('/expenses/ocr-scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      if (data.success && data.amount) {
        setResult(data);
        onScanSuccess?.({
          amount: data.amount,
          date: data.date,
          description: data.description || data.merchantName,
        });
      } else {
        setError('Could not read receipt. Fill details manually.');
      }
    } catch (err) {
      setError('Could not read receipt. Fill details manually.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-outline-variant/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/50 transition-all"
      >
        <Upload className="w-8 h-8 text-outline mx-auto mb-2" />
        <p className="text-sm text-on-surface-variant">
          Drag & drop receipt or{' '}
          <span className="text-primary font-medium">click to browse</span>
        </p>
        <p className="text-xs text-outline mt-1">JPEG, PNG up to 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden bg-surface-container-low">
          <img src={preview} alt="Receipt preview" className="w-full max-h-48 object-contain" />
        </div>
      )}

      {file && !result && (
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning receipt...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              🔍 Scan with OCR
            </>
          )}
        </button>
      )}

      {result && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">
            Receipt scanned successfully! Fields auto-filled.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}
    </div>
  );
}
