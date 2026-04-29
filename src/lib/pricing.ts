// Approximate center coordinates for each Algerian wilaya
const WILAYA_COORDS: Record<string, [number, number]> = {
  "أدرار":           [27.87, -0.29],
  "الشلف":           [36.16, 1.33],
  "الأغواط":         [33.80, 2.87],
  "أم البواقي":      [35.90, 7.11],
  "باتنة":           [35.56, 6.17],
  "بجاية":           [36.75, 5.06],
  "بسكرة":           [34.85, 5.73],
  "بشار":            [31.62, -2.22],
  "البليدة":         [36.47, 2.83],
  "البويرة":         [36.37, 3.90],
  "تمنراست":         [22.79, 5.52],
  "تبسة":            [35.40, 8.12],
  "تلمسان":          [34.88, -1.32],
  "تيارت":           [35.37, 1.32],
  "تيزي وزو":        [36.72, 4.05],
  "الجزائر":         [36.74, 3.06],
  "الجلفة":          [34.67, 3.26],
  "جيجل":            [36.82, 5.77],
  "سطيف":            [36.19, 5.41],
  "سعيدة":           [34.84, 0.15],
  "سكيكدة":          [36.88, 6.90],
  "سيدي بلعباس":     [35.19, -0.63],
  "عنابة":           [36.90, 7.77],
  "قالمة":           [36.46, 7.43],
  "قسنطينة":         [36.37, 6.61],
  "المدية":          [36.27, 2.75],
  "مستغانم":         [35.93, 0.09],
  "المسيلة":         [35.70, 4.54],
  "معسكر":           [35.40, 0.14],
  "ورقلة":           [31.95, 5.32],
  "وهران":           [35.70, -0.63],
  "البيض":           [33.69, 1.00],
  "إليزي":           [26.49, 8.48],
  "برج بوعريريج":    [36.07, 4.76],
  "بومرداس":         [36.76, 3.48],
  "الطارف":          [36.76, 8.31],
  "تندوف":           [27.67, -8.14],
  "تيسمسيلت":        [35.61, 1.81],
  "الوادي":          [33.37, 6.87],
  "خنشلة":           [35.44, 7.14],
  "سوق أهراس":       [36.28, 7.95],
  "تيبازة":          [36.61, 2.47],
  "ميلة":            [36.45, 6.26],
  "عين الدفلى":      [36.26, 1.97],
  "النعامة":         [33.27, -0.31],
  "عين تموشنت":      [35.30, -1.45],
  "غرداية":          [32.49, 3.67],
  "غليزان":          [35.97, 0.57],
  "تيميمون":         [29.26, 0.24],
  "برج باجي مختار":  [21.33, 0.95],
  "أولاد جلال":      [34.42, 5.04],
  "بني عباس":        [30.13, -2.17],
  "إن صالح":         [27.19, 2.47],
  "إن قزام":         [24.00, 5.77],
  "تقرت":            [33.06, 6.07],
  "جانت":            [24.55, 9.48],
  "المغير":          [33.96, 5.92],
  "المنيعة":         [29.79, 2.88],
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SIZE_MULTIPLIER: Record<string, number> = {
  small: 0.8,
  medium: 1.0,
  large: 1.3,
  extra_large: 1.7,
};

// Returns { distanceKm, minPrice, maxPrice } — prices in DZD
export function calcPrice(
  fromCity: string,
  toCity: string,
  weightKg: number,
  size: string
): { distanceKm: number; minPrice: number; maxPrice: number } | null {
  const a = WILAYA_COORDS[fromCity];
  const b = WILAYA_COORDS[toCity];
  if (!a || !b) return null;

  const distanceKm = Math.round(haversineKm(a[0], a[1], b[0], b[1]));
  const sizeMult = SIZE_MULTIPLIER[size] ?? 1;

  // Formula: 800 DZD base + 7 DZD/km + 30 DZD/kg, scaled by size
  const base = (800 + distanceKm * 7 + weightKg * 30) * sizeMult;
  const minPrice = Math.round(base * 0.85 / 100) * 100;
  const maxPrice = Math.round(base * 1.20 / 100) * 100;

  return { distanceKm, minPrice, maxPrice };
}
