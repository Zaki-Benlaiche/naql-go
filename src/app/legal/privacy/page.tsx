import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | NaqlGo",
  description: "كيف نجمع بياناتك ونستخدمها ونحميها — تطبيق NaqlGo للنقل والشحن في الجزائر.",
};

export default function PrivacyPage() {
  return (
    <div dir="rtl" lang="ar">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500 mb-8">آخر تحديث: 11 ماي 2026</p>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">1. من نحن</h2>
        <p>
          <strong>NaqlGo</strong> منصة جزائرية لخدمات النقل والشحن، تربط
          العملاء بسائقين محليين عبر تطبيق هاتف وموقع إلكتروني.
          تنطبق هذه السياسة على كل من يستخدم خدماتنا.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">2. البيانات التي نجمعها</h2>
        <p>عند التسجيل واستخدام التطبيق، نجمع:</p>
        <ul>
          <li><strong>بيانات الحساب:</strong> الاسم، رقم الهاتف، البريد الإلكتروني (اختياري)، كلمة السر (مُشفَّرة).</li>
          <li><strong>بيانات الملف الشخصي (للسائق):</strong> الولاية، نوع المركبة ولونها، الخدمات المُقدَّمة.</li>
          <li><strong>وثائق التحقق (للسائق):</strong> صور رخصة السياقة، البطاقة الرمادية، التأمين.</li>
          <li><strong>بيانات الطلبات:</strong> نقاط الانطلاق والوصول، نوع البضاعة، السعر، حالة التسليم.</li>
          <li><strong>بيانات الموقع الجغرافي (GPS):</strong> أثناء تنفيذ الطلب فقط، لتتبع التوصيل.</li>
          <li><strong>الرسائل والتقييمات:</strong> محادثات الشات بين العميل والسائق، التقييمات والتعليقات.</li>
          <li><strong>بيانات تقنية:</strong> نوع الجهاز، نظام التشغيل، معرّف الإشعارات (FCM).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">3. لماذا نجمع هذه البيانات</h2>
        <ul>
          <li>إنشاء حسابك والسماح لك بتسجيل الدخول.</li>
          <li>ربط العملاء بالسائقين المناسبين حسب الموقع والخدمة.</li>
          <li>التحقق من هوية السائقين ومركباتهم قبل السماح لهم بالعمل.</li>
          <li>تتبع الطلبات وضمان وصول البضائع.</li>
          <li>إرسال إشعارات حول حالة الطلب (طلب جديد، عرض، قبول، تسليم).</li>
          <li>منع الاحتيال وحماية المنصة.</li>
          <li>حساب العمولات والإحصائيات الداخلية.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">4. مع من نشارك بياناتك</h2>
        <p>لا نبيع بياناتك. نشاركها فقط في الحالات التالية:</p>
        <ul>
          <li><strong>بين أطراف الطلب:</strong> العميل يرى اسم السائق ورقم هاتفه وتقييمه، والسائق يرى نفس البيانات عن العميل. هذا ضروري لإتمام الخدمة.</li>
          <li><strong>مزودو الخدمة التقنيين:</strong> Vercel (الاستضافة)، Neon (قاعدة البيانات)، Firebase (إشعارات Push)، Vercel Blob (تخزين الصور). يلتزم جميعهم بمعايير حماية البيانات الدولية.</li>
          <li><strong>السلطات القانونية:</strong> فقط عند طلب قضائي رسمي.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">5. كيف نحمي بياناتك</h2>
        <ul>
          <li>كلمات السر مُشفَّرة بـ bcrypt (لا يمكن لأحد قراءتها، حتى نحن).</li>
          <li>كل الاتصالات بين التطبيق والخادم مشفَّرة عبر HTTPS/TLS.</li>
          <li>الوثائق الحسّاسة تُحفظ في تخزين مُؤمَّن منفصل عن قاعدة البيانات.</li>
          <li>صلاحيات الوصول مقتصرة على الحد الأدنى الضروري.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">6. حقوقك</h2>
        <p>طبقاً للقانون الجزائري 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي، لك الحق في:</p>
        <ul>
          <li><strong>الاطلاع:</strong> معرفة البيانات التي نحتفظ بها عنك.</li>
          <li><strong>التعديل:</strong> تصحيح أي بيانات خاطئة في ملفك الشخصي.</li>
          <li><strong>الحذف:</strong> حذف حسابك وجميع بياناتك من خلال صفحة <a href="/legal/delete-account" className="text-orange-600 hover:underline">حذف الحساب</a>.</li>
          <li><strong>الاعتراض:</strong> رفض معالجة بياناتك لأغراض غير ضرورية.</li>
          <li><strong>الشكوى:</strong> التوجه للسلطة الوطنية لحماية المعطيات ذات الطابع الشخصي (ANPDP).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">7. مدة الاحتفاظ بالبيانات</h2>
        <ul>
          <li>بيانات الحساب: طالما الحساب نشط.</li>
          <li>بيانات الطلبات: 5 سنوات بعد التسليم (للأغراض المحاسبية).</li>
          <li>بيانات الموقع GPS: تُحذف تلقائياً بعد 7 أيام من تسليم الطلب.</li>
          <li>الإشعارات المقروءة: تُحذف تلقائياً بعد 30 يوماً.</li>
          <li>بعد حذف الحساب: تُحذف كل البيانات الشخصية فوراً.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">8. الأطفال</h2>
        <p>التطبيق غير مخصص للأطفال دون 18 سنة. لا نجمع بيانات بشكل متعمد من القاصرين.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">9. التغييرات على هذه السياسة</h2>
        <p>قد نُحدِّث هذه السياسة. أي تغيير جوهري سنُخطرك به عبر التطبيق قبل سريانه.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">10. التواصل معنا</h2>
        <p>
          لأي استفسار أو طلب يتعلق ببياناتك، تواصل معنا عبر التطبيق أو على البريد:
          <br />
          <strong>benlaichezakaria1902@gmail.com</strong>
        </p>
      </section>
    </div>
  );
}
