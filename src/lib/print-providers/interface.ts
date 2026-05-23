// 印刷・販売プロバイダの抽象化レイヤ。
// Phase A は SUZURI、将来 Stripe + 自前印刷業者に切替可能にする。

export interface PrintItem {
  /** 加工済み画像 (Base64) */
  imageBase64: string;
  /** シールサイズ (cm) */
  size: { widthCm: number; heightCm: number };
  /** 注文枚数 */
  quantity: number;
}

export interface PrintOrderInput {
  userId: string;
  items: PrintItem[];
}

export interface PrintOrderResult {
  provider: string;
  /** プロバイダ側の注文 ID */
  providerOrderId: string;
  /** ユーザを誘導する決済 / 商品ページ URL */
  checkoutUrl: string;
  /** 概算合計 (円) */
  totalJpy?: number;
}

export interface PrintProvider {
  readonly name: string;
  createOrder(input: PrintOrderInput): Promise<PrintOrderResult>;
}
