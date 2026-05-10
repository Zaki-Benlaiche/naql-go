# إعداد إشعارات Push (FCM) — خطوة بخطوة

كل الكود جاهز. تبقّى **6 خطوات يدوية** خارج الكود (Firebase Console + Vercel).
بدون هذه الخطوات الإشعارات لن تعمل، لكن **التطبيق سيستمر بالعمل عادياً** (الكود مكتوب fail-safe).

---

## 1. إنشاء مشروع Firebase (~3 دقائق)

1. افتح https://console.firebase.google.com → **Add project**.
2. اسم المشروع: `NaqlGo` (أو ما تشاء).
3. عطّل Google Analytics (لسنا بحاجته الآن).
4. اضغط **Create**.

---

## 2. إضافة تطبيق Android (~2 دقيقة)

1. داخل المشروع → أيقونة Android (`Add app`).
2. **Android package name**: `com.naqlgo.app`
   *(يجب أن يطابق `applicationId` في* `android/app/build.gradle` *— هو كذلك بالفعل.)*
3. **App nickname**: `NaqlGo Android`
4. **Debug signing certificate SHA-1**: اتركه فارغاً الآن (يحتاج فقط لـ Google Sign-In، نحن لا نستخدمه).
5. اضغط **Register app**.

---

## 3. تنزيل `google-services.json` (~30 ثانية)

1. زر **Download google-services.json**.
2. **ضع الملف بالضبط هنا**:
   ```
   c:\Users\hp\Desktop\naqlgo\naqlgo\android\app\google-services.json
   ```
3. تأكد أن الاسم بالضبط `google-services.json` (لا أرقام مكررة).

✅ التطبيق سيكتشفه تلقائياً عند البناء التالي (المنطق موجود في [android/app/build.gradle:47-54](android/app/build.gradle#L47-L54)).

---

## 4. إنشاء Service Account للسيرفر (~3 دقائق)

السيرفر (Vercel) يحتاج صلاحية إرسال إشعارات.

1. Firebase Console → ⚙️ **Project settings** → تبويب **Service accounts**.
2. اضغط **Generate new private key** → **Generate key**.
3. سيتم تنزيل ملف JSON. **افتحه** بمحرر نصوص.
4. ستجد 3 حقول مهمة:
   ```json
   {
     "project_id": "naqlgo-xxxx",
     "client_email": "firebase-adminsdk-xxxx@naqlgo-xxxx.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   }
   ```

---

## 5. إضافة المتغيرات لـ Vercel (~2 دقيقة)

1. افتح https://vercel.com/dashboard → مشروع NaqlGo → **Settings** → **Environment Variables**.
2. أضف **3 متغيرات** (لكل البيئات Production / Preview / Development):

| Name | Value |
|------|-------|
| `FCM_PROJECT_ID` | قيمة `project_id` من ملف JSON |
| `FCM_CLIENT_EMAIL` | قيمة `client_email` من ملف JSON |
| `FCM_PRIVATE_KEY` | قيمة `private_key` كاملة **مع `\n`** بين الأسطر (لا تعدّل الصيغة، انسخ كما هي من JSON) |

⚠️ **انتباه على `FCM_PRIVATE_KEY`**:
- إذا نسخت من ملف JSON، الأسطر ستكون مكتوبة كـ `\n` ضمن السلسلة → ضعها كما هي.
- إذا نسخت من ملف PEM، الأسطر ستكون حقيقية → Vercel يقبل ذلك أيضاً.
- الكود يعالج الحالتين تلقائياً ([src/lib/push.ts:31](src/lib/push.ts#L31)).

3. **Redeploy** المشروع لتفعيل المتغيرات (أو ادفع commit جديد).

---

## 6. تطبيق Migration على Neon (~30 ثانية)

DB يحتاج جدول `device_tokens`. Migration جاهز في:
```
prisma/migrations/20260510_device_tokens/migration.sql
```

سيتم تطبيقه تلقائياً عند build الـ Vercel التالي (`prisma migrate deploy` ضمن build script).

أو يدوياً محلياً:
```bash
npx prisma migrate deploy
```

---

## 7. بناء APK جديد ورفعه (~5 دقائق)

```bash
npm run build:apk
cd android
./gradlew assembleDebug
```

ثم انسخ:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

إلى `public/naqlgo.apk` ثم `git push`.

---

## ✅ اختبار الإشعارات

### الطريقة الأسرع: من Firebase Console
1. Firebase Console → **Engage** → **Messaging** → **Create your first campaign**.
2. اختر **Firebase Notification messages**.
3. اكتب عنوان ونصاً.
4. **Target**: اختر app `com.naqlgo.app`.
5. **Send test message** → الصق رمز FCM لجهازك (تجده في logs الـ APK عند تسجيل الدخول، البحث عن `[push] register API`).

### الطريقة الحقيقية: داخل التطبيق
1. اطلب من سائق وعميل تسجيل الدخول من جهازين مختلفين.
2. العميل ينشئ طلباً مباشراً (INTRA) ويختار السائق.
3. السائق يجب أن يستقبل إشعار **"📦 طلب نقل مباشر جديد"** فوراً.
4. السائق يقدم عرضاً → العميل يستقبل **"💰 عرض جديد على طلبك"**.
5. العميل يقبل العرض → السائق يستقبل **"🎉 تم قبول عرضك!"**.

---

## ❓ مشاكل شائعة

| المشكلة | السبب | الحل |
|---------|-------|------|
| لا تظهر إشعارات على Android 13+ | المستخدم رفض إذن POST_NOTIFICATIONS | الذهاب لإعدادات التطبيق → Notifications → السماح |
| البناء يفشل: `google-services.json missing` | الملف غير موجود | راجع خطوة 3 |
| لا يصل أي إشعار | متغيرات Vercel غير مضبوطة | راجع خطوة 5 + ` curl https://naql-go.vercel.app` بعد deploy |
| الإشعار لا يفتح الصفحة الصحيحة | المستخدم غير مسجل دخول | [PushBridge.tsx](src/components/PushBridge.tsx) يرسله إلى /dashboard |
| رمز FCM يتغير | عادي — يحدث بعد reinstall أو امسح بيانات | الكود يعمل upsert، التطبيق يعيد التسجيل تلقائياً |

---

## 🎯 ما يجب أن تفعله الآن

1. **خطوات 1-2-3** من Firebase Console (10 دقائق)
2. **خطوات 4-5** للسيرفر (5 دقائق)
3. **خطوة 7** بناء APK جديد ورفعه
4. اختبار مع صديق على هاتفين مختلفين

التكلفة الإجمالية: **صفر** — Firebase Cloud Messaging مجاني بالكامل لأي حجم.
