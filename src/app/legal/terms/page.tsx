import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام | NaqlGo",
  description: "شروط استخدام تطبيق NaqlGo للنقل والشحن في الجزائر.",
};

export default function TermsPage() {
  return (
    <div dir="rtl" lang="ar">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">شروط الاستخدام</h1>
      <p className="text-sm text-slate-500 mb-8">آخر تحديث: 11 ماي 2026</p>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">1. قبول الشروط</h2>
        <p>
          باستخدامك تطبيق <strong>NaqlGo</strong> أو الموقع الإلكتروني، فإنك توافق
          على الالتزام بهذه الشروط. إذا لم توافق، يُرجى التوقف عن استخدام الخدمة.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">2. طبيعة الخدمة</h2>
        <p>
          NaqlGo منصة وسيطة <strong>تربط العميل بالسائق</strong>. نحن لا نملك
          المركبات ولا نقوم بعمليات النقل بأنفسنا. كل عملية نقل تتم مباشرة بين
          العميل والسائق المسجَّل، وكل طرف مسؤول عن دوره.
        </p>
        <p>تتضمن المنصة ثلاث خدمات:</p>
        <ul>
          <li><strong>Livreur (موصِّل):</strong> توصيل الطرود الصغيرة.</li>
          <li><strong>Frodeur (تاكسي):</strong> نقل الأشخاص.</li>
          <li><strong>Transporteur (نقل):</strong> نقل البضائع والأثاث.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">3. التسجيل والحساب</h2>
        <ul>
          <li>يجب أن تكون قد بلغت 18 سنة.</li>
          <li>يجب تقديم معلومات صحيحة وحديثة.</li>
          <li>أنت مسؤول عن سرية كلمة السر وكل النشاطات التي تتم من حسابك.</li>
          <li>السائقون مُلزَمون بتقديم وثائق صحيحة (رخصة السياقة، البطاقة الرمادية، التأمين).</li>
          <li>يمر كل سائق بمرحلة <strong>تحقق يدوي (KYC)</strong> من قبل إدارة المنصة قبل أن يبدأ العمل.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">4. مسؤوليات العميل</h2>
        <ul>
          <li>تقديم معلومات صحيحة عن الطلب (الموقع، نوع البضاعة، الوزن).</li>
          <li>التواجد في موعد الاستلام والتسليم.</li>
          <li>دفع السعر المتفق عليه فور تسليم الخدمة.</li>
          <li>عدم استخدام الخدمة لنقل مواد ممنوعة قانونياً (مخدرات، أسلحة، مواد متفجرة، إلخ).</li>
          <li>احترام السائق وعدم استخدام لغة مسيئة في الشات.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">5. مسؤوليات السائق</h2>
        <ul>
          <li>امتلاك رخصة سياقة سارية المفعول ومركبة مؤمَّنة.</li>
          <li>احترام قانون المرور.</li>
          <li>التعامل مع البضاعة بحرص وتسليمها في الموعد المتفق عليه.</li>
          <li>تقديم سعر عادل وعدم استغلال العميل.</li>
          <li>إبلاغ المنصة بأي حادث أو نزاع فوراً.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">6. الأسعار والعمولة</h2>
        <ul>
          <li>السعر يحدّده <strong>السائق</strong>، ويقبله أو يرفضه العميل.</li>
          <li>تأخذ المنصة <strong>عمولة 10٪</strong> من كل عملية مكتملة.</li>
          <li>يحصل السائق على <strong>90٪</strong> من السعر صافي.</li>
          <li>الدفع حالياً <strong>نقداً</strong> بين العميل والسائق مباشرة.</li>
          <li>على السائق تحويل العمولة الشهرية لحساب المنصة.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">7. الإلغاء والاسترداد</h2>
        <ul>
          <li>يمكن للعميل إلغاء الطلب قبل قبول السائق له.</li>
          <li>بعد قبول السائق، الإلغاء يخضع لاتفاق الطرفين.</li>
          <li>في حالة عدم تنفيذ الخدمة، لا تحصل المنصة على أي عمولة.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">8. المحتوى الممنوع</h2>
        <p>يمنع استخدام المنصة لأي مما يلي:</p>
        <ul>
          <li>نقل مواد غير قانونية.</li>
          <li>الاحتيال أو انتحال صفة شخص آخر.</li>
          <li>إرسال محتوى مسيء أو تهديدي عبر الشات.</li>
          <li>محاولة اختراق المنصة أو الإضرار بها تقنياً.</li>
          <li>إساءة استخدام نظام التقييمات (تقييم بدون خدمة فعلية).</li>
        </ul>
        <p>أي مخالفة تؤدي إلى <strong>حظر الحساب</strong> فوراً ودون إشعار مسبق.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">9. حدود المسؤولية</h2>
        <p>
          NaqlGo منصة وسيطة فقط. نحن لا نتحمل المسؤولية المباشرة عن:
        </p>
        <ul>
          <li>الحوادث المرورية أثناء التنقل.</li>
          <li>تلف البضاعة أو فقدانها.</li>
          <li>التأخر في التسليم.</li>
          <li>النزاعات بين العميل والسائق.</li>
        </ul>
        <p>
          المسؤولية القانونية تقع على عاتق السائق المُنفِّذ للخدمة، الذي يلتزم
          بتأمين مركبته ضد الأضرار.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">10. التقييمات</h2>
        <ul>
          <li>كل عميل له الحق في تقييم السائق بعد التسليم (1-5 نجوم + تعليق).</li>
          <li>التقييمات نهائية ولا يمكن تغييرها.</li>
          <li>المنصة لا تتدخل في التقييمات إلا في حالة إساءة واضحة.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">11. الملكية الفكرية</h2>
        <p>
          اسم NaqlGo، الشعار، التصميم، الكود — كلها ملكية حصرية لـ NaqlGo.
          لا يحق استخدامها بدون إذن كتابي مسبق.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">12. التعديلات</h2>
        <p>
          نحتفظ بحق تعديل هذه الشروط في أي وقت. التعديلات الجوهرية ستُخطرك بها
          عبر التطبيق. استمرارك في استخدام الخدمة يُعتبر قبولاً للشروط الجديدة.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">13. القانون المُطبَّق</h2>
        <p>
          تخضع هذه الشروط للقانون الجزائري. أي نزاع يحل ودياً أولاً، وفي حالة عدم
          الوصول لاتفاق، يحال للمحاكم المختصة في الجزائر.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">14. التواصل</h2>
        <p>
          لأي استفسار: <strong>benlaichezakaria1902@gmail.com</strong>
        </p>
      </section>
    </div>
  );
}
