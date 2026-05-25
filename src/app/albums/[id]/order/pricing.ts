export type SizeKey = "5x5" | "7x7" | "10x10";

export const SIZE_OPTIONS: {
  key: SizeKey;
  label: string;
  widthCm: number;
  heightCm: number;
  unitJpy: number;
  recommended?: boolean;
}[] = [
  { key: "5x5", label: "5×5cm", widthCm: 5, heightCm: 5, unitJpy: 200 },
  { key: "7x7", label: "7×7cm", widthCm: 7, heightCm: 7, unitJpy: 300, recommended: true },
  { key: "10x10", label: "10×10cm", widthCm: 10, heightCm: 10, unitJpy: 500 },
];

export const SHIPPING_JPY = 250;

export function getSize(key: SizeKey) {
  return SIZE_OPTIONS.find((s) => s.key === key) ?? SIZE_OPTIONS[1];
}

export function calcTotal(
  sizeKey: SizeKey,
  itemQuantities: number[]
): { subtotal: number; shipping: number; total: number; totalQty: number } {
  const size = getSize(sizeKey);
  const totalQty = itemQuantities.reduce((s, q) => s + q, 0);
  const subtotal = totalQty * size.unitJpy;
  return {
    subtotal,
    shipping: SHIPPING_JPY,
    total: subtotal + SHIPPING_JPY,
    totalQty,
  };
}
