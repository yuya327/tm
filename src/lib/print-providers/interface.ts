// 印刷・販売プロバイダの抽象化レイヤ。
// Phase A は SUZURI、将来 Stripe + 自前印刷業者に切替可能にする。

export interface PrintItem {
  /** 注文アイテム ID（DB の print_order_items.id を想定） */
  itemId: string;
  /** 加工済み画像 (data URI: "data:image/png;base64,...") */
  imageDataUri: string;
  /** 表示用タイトル（SUZURI の material title になる） */
  title: string;
  /** シールサイズ (cm) — SUZURI ではメタ情報として扱う */
  size: { widthCm: number; heightCm: number };
  /** 注文枚数（SUZURI では商品URLに反映できない情報。記録のみ） */
  quantity: number;
}

export interface PrintOrderInput {
  userId: string;
  items: PrintItem[];
}

export interface PrintOrderItemResult {
  itemId: string;
  /** SUZURI material ID 等のプロバイダ側 ID */
  providerItemId: string;
  /** 個別商品ページ URL */
  productUrl: string;
}

export interface PrintOrderResult {
  provider: string;
  /** プロバイダ側の注文 ID（SUZURI には注文概念がないので空文字でも可） */
  providerOrderId: string;
  /** ユーザを最初に誘導する URL（先頭商品ページ等） */
  checkoutUrl: string;
  /** アイテム別の結果 */
  items: PrintOrderItemResult[];
}

export interface PrintProvider {
  readonly name: string;
  createOrder(input: PrintOrderInput): Promise<PrintOrderResult>;
}
