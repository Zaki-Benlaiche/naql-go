import Link from "next/link";
import { Truck, Package, Clock, Star, ArrowLeft, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">NaqlGo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2">
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors"
          >
            ابدأ الآن
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          منصة النقل والشحن الأولى في الجزائر
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          انقل بضائعك بأفضل سعر
          <br />
          <span className="text-orange-500">في الجزائر كلها</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          انشر طلب النقل، استقبل عروض الأسعار من الناقلين، واختر الأنسب لك.
          سريع، موثوق، وبأفضل سعر.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register?role=CLIENT"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors flex items-center gap-2"
          >
            أريد نقل بضائع
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/register?role=TRANSPORTER"
            className="border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg transition-colors"
          >
            أنا ناقل — سجّل مركبتي
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">كيف يعمل NaqlGo؟</h2>
          <p className="text-gray-500 text-center mb-14">ثلاث خطوات بسيطة وبضاعتك في الطريق</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-orange-500" />
                </div>
                <div className="text-4xl font-black text-orange-100 mb-2">{i + 1}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">خدماتنا</h2>
        <p className="text-gray-500 text-center mb-14">لكل نوع بضاعة الناقل المناسب</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 text-center hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-500 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black mb-1">{s.value}</div>
              <div className="text-orange-100 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why NaqlGo */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">لماذا NaqlGo؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50">
              <CheckCircle className="w-6 h-6 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-gray-900 mb-1">{f.title}</div>
                <div className="text-gray-500 text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">جاهز تبدأ؟</h2>
        <p className="text-gray-400 mb-8">سجّل الآن مجاناً وابدأ في الوصول لآلاف الناقلين</p>
        <Link
          href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors inline-block"
        >
          إنشاء حساب مجاني
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
            <Truck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-700">NaqlGo</span>
        </div>
        © 2025 NaqlGo. جميع الحقوق محفوظة — الجزائر
      </footer>
    </div>
  );
}

const steps = [
  { icon: Package, title: "انشر طلبك", desc: "حدد نوع البضاعة، الوزن، نقطة الانطلاق والوجهة في أقل من دقيقة" },
  { icon: Star, title: "استقبل العروض", desc: "الناقلون القريبون يقدمون أسعارهم وأوقات التسليم — قارن واختر الأنسب" },
  { icon: Clock, title: "تتبع شحنتك", desc: "راقب رحلة بضاعتك في الوقت الفعلي حتى تصل بأمان" },
];

const services = [
  { emoji: "📦", name: "توصيل طرود", sub: "دراجة / سيارة" },
  { emoji: "🛋️", name: "نقل أثاث", sub: "فان / شاحنة" },
  { emoji: "🏗️", name: "مواد بناء", sub: "شاحنة ثقيلة" },
  { emoji: "🌡️", name: "سلسلة باردة", sub: "مبردة" },
  { emoji: "🚛", name: "بين الولايات", sub: "شحن طويل" },
];

const stats = [
  { value: "500+", label: "ناقل مسجل" },
  { value: "48", label: "ولاية مغطاة" },
  { value: "2000+", label: "شحنة منجزة" },
  { value: "4.8★", label: "متوسط التقييم" },
];

const features = [
  { title: "نظام المناداة (يعنري)", desc: "الناقلون يتنافسون على طلبك مما يضمن لك أفضل سعر في السوق" },
  { title: "ناقلون موثّقون", desc: "كل ناقل يمر بعملية التحقق من الهوية والرخصة والمركبة" },
  { title: "دفع آمن", desc: "ادفع عند الاستلام أو إلكترونياً عبر بريدي موب / CIB" },
  { title: "دعم على مدار الساعة", desc: "فريق الدعم متاح لحل أي مشكلة في أي وقت" },
];
