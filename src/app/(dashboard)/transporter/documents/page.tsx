"use client";
import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Upload, CheckCircle, Clock, XCircle, Camera } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Doc = { id: string; type: string; status: string; createdAt: string };

const DOC_TYPES = [
  { value: "license",     labelKey: "doc_license"     as const, icon: "🪪" },
  { value: "vehicle_reg", labelKey: "doc_vehicle_reg" as const, icon: "📋" },
  { value: "insurance",   labelKey: "doc_insurance"   as const, icon: "🛡️" },
  { value: "other",       labelKey: "doc_other"       as const, icon: "📄" },
];

function statusIcon(status: string) {
  if (status === "APPROVED") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === "REJECTED") return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-orange-400" />;
}

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1200 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentsPage() {
  const { tr } = useLanguage();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetType, setTargetType] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/documents");
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(null), 3000);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !targetType) return;
    setUploading(targetType);
    try {
      const fileData = await compress(file);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: targetType, fileData }),
      });
      if (res.ok) { showToast(tr("doc_uploaded_ok")); await load(); }
    } finally {
      setUploading(null); setTargetType(null); e.target.value = "";
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={handleFile} />

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
            {toast}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("my_documents")}</h1>
          <p className="text-gray-500 text-sm mt-1">{tr("doc_hint")}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {DOC_TYPES.map(docType => {
              const existing = docs.find(d => d.type === docType.value);
              const isUploading = uploading === docType.value;

              return (
                <div key={docType.value}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm ${
                    existing?.status === "APPROVED" ? "border-green-100"
                    : existing?.status === "REJECTED" ? "border-red-100"
                    : "border-gray-100"
                  }`}>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {docType.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{tr(docType.labelKey)}</p>
                    {existing ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {statusIcon(existing.status)}
                        <span className={`text-xs font-medium ${
                          existing.status === "APPROVED" ? "text-green-600"
                          : existing.status === "REJECTED" ? "text-red-500"
                          : "text-orange-500"
                        }`}>
                          {existing.status === "APPROVED" ? tr("doc_approved")
                          : existing.status === "REJECTED" ? tr("doc_rejected")
                          : tr("doc_pending")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">لم يُرفع بعد</p>
                    )}
                  </div>

                  {/* Upload button */}
                  <button
                    onClick={() => { setTargetType(docType.value); fileInputRef.current?.click(); }}
                    disabled={isUploading}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shrink-0 ${
                      existing
                        ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                    }`}
                  >
                    {isUploading
                      ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : existing
                        ? <><Upload className="w-3.5 h-3.5" /> {tr("doc_replace")}</>
                        : <><Camera className="w-3.5 h-3.5" /> {tr("doc_upload")}</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            {tr("doc_hint")} — سيقوم الفريق بمراجعة وثائقك خلال 24 ساعة.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
