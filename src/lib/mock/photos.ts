// UI モックアップ用のダミー画像データ。Phase 8 後半で実画像に置き換える。

export type MockPhoto = {
  id: string;
  src: string;
  starred?: boolean;
};

const seeds = [
  "kyoto1",
  "kyoto2",
  "kyoto3",
  "kyoto4",
  "kyoto5",
  "kyoto6",
  "kyoto7",
  "kyoto8",
  "kyoto9",
  "kyoto10",
];

export const mockPhotos: MockPhoto[] = seeds.map((s, i) => ({
  id: s,
  src: `https://picsum.photos/seed/${s}/600/600`,
  starred: i < 7,
}));

export const mockAlbums = [
  { id: "kyoto-spring", name: "京都 春旅", count: 87, status: "完了", date: "2026-05-12" },
  { id: "hokkaido", name: "北海道", count: 32, status: "完了", date: "2026-04-30" },
  { id: "hawaii", name: "Hawaii", count: 15, status: "加工中", date: "2026-05-20" },
];

export const mockOrders = [
  {
    id: "ORD-0012",
    album: "京都 春旅",
    qty: 8,
    sizeCm: "7×7cm",
    totalJpy: 2650,
    status: "発送済み",
    date: "2026-05-20",
  },
  {
    id: "ORD-0011",
    album: "Hawaii",
    qty: 4,
    sizeCm: "10×10cm",
    totalJpy: 3200,
    status: "印刷中",
    date: "2026-05-18",
  },
];
