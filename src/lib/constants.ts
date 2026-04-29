// Single source of truth for data shared between client and transporter UIs.
// Both sides MUST use the same values so DB queries match correctly.

export const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة",
  "بشار", "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت",
  "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة",
  "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة",
  "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس",
  "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس",
  "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تيموشنت", "غرداية",
  "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة",
] as const;

// INTRA vehicle types — value stored in DB for BOTH transporter profile and client request
export const VEHICLE_TYPES = [
  { value: "car",        icon: "🚗", labelAr: "سيارة",        labelFr: "Voiture",       descAr: "حتى 500 كغ",    descFr: "Jusqu'à 500 kg"   },
  { value: "van",        icon: "🚐", labelAr: "فان",           labelFr: "Fourgonnette",  descAr: "500 كغ – 3 طن",  descFr: "500 kg – 3 T"     },
  { value: "truck",      icon: "🚛", labelAr: "شاحنة",         labelFr: "Camion",        descAr: "3 طن فأكثر",     descFr: "3 T et plus"      },
  { value: "motorcycle", icon: "🏍️", labelAr: "دراجة توصيل",  labelFr: "Moto livraison",descAr: "طرود صغيرة",    descFr: "Petits colis"     },
] as const;

export type VehicleTypeValue = typeof VEHICLE_TYPES[number]["value"];
