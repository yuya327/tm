// SUZURI を呼ばずにダミー URL を返すスタブ。
// ローカル開発で SUZURI 無駄叩きを避けたいとき用。

import type {
  PrintOrderInput,
  PrintOrderItemResult,
  PrintOrderResult,
  PrintProvider,
} from "./interface";

export class StubPrintProvider implements PrintProvider {
  readonly name = "stub";

  async createOrder(input: PrintOrderInput): Promise<PrintOrderResult> {
    const items: PrintOrderItemResult[] = input.items.map((it) => ({
      itemId: it.itemId,
      providerItemId: `stub-${Math.random().toString(36).slice(2, 10)}`,
      productUrl: `https://suzuri.jp/?stub=${encodeURIComponent(it.itemId)}`,
    }));

    return {
      provider: this.name,
      providerOrderId: `stub-order-${Date.now()}`,
      checkoutUrl: items[0]?.productUrl ?? "https://suzuri.jp/",
      items,
    };
  }
}
