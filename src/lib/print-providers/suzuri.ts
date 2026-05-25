// SUZURI API 実装。
// 各アイテムごとに POST /api/v1/materials を呼び、ステッカー商品を1点ずつ作成する。
// 認証: Bearer Token (SUZURI_API_TOKEN)
// docs: https://suzuri.jp/developer/documentation/v1

import type {
  PrintOrderInput,
  PrintOrderItemResult,
  PrintOrderResult,
  PrintProvider,
} from "./interface";

// ステッカー（item id = 11）の唯一の variant: M / ホワイト
const STICKER_ITEM_ID = 11;
const STICKER_EXEMPLARY_VARIANT_ID = 606;

interface SuzuriCreateMaterialResponse {
  material: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    texture: string;
  };
  products: {
    id: number;
    title: string;
    sampleUrl: string;
    url: string;
    item: { id: number; name: string };
    publishedAt: string | null;
  }[];
}

export class SuzuriPrintProvider implements PrintProvider {
  readonly name = "suzuri";

  private readonly endpoint = "https://suzuri.jp/api/v1/materials";

  constructor(private readonly token: string) {
    if (!token) {
      throw new Error("SUZURI_API_TOKEN が未設定です");
    }
  }

  async createOrder(input: PrintOrderInput): Promise<PrintOrderResult> {
    const results: PrintOrderItemResult[] = [];

    for (const item of input.items) {
      const material = await this.createMaterial(item.title, item.imageDataUri);
      const product = material.products.find((p) => p.item.id === STICKER_ITEM_ID);
      if (!product) {
        throw new Error(
          `SUZURI: material ${material.material.id} にステッカー商品が含まれていません`
        );
      }
      results.push({
        itemId: item.itemId,
        providerItemId: String(material.material.id),
        productUrl: product.sampleUrl ?? product.url,
      });
    }

    return {
      provider: this.name,
      providerOrderId: "",
      checkoutUrl: results[0]?.productUrl ?? "https://suzuri.jp/",
      items: results,
    };
  }

  private async createMaterial(
    title: string,
    imageDataUri: string
  ): Promise<SuzuriCreateMaterialResponse> {
    const body = {
      texture: imageDataUri,
      title,
      products: [
        {
          itemId: STICKER_ITEM_ID,
          exemplaryItemVariantId: STICKER_EXEMPLARY_VARIANT_ID,
          // SUZURI は非公開だと商品 URL が 404 になり購入できない。
          // 公開しないと自分でも購入導線に乗れないため published: true にする。
          // ショップ表示が気になる場合は SUZURI ダッシュボードから手動で非公開化できる。
          published: true,
          resizeMode: "contain",
        },
      ],
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`SUZURI API ${res.status}: ${errText}`);
    }

    return (await res.json()) as SuzuriCreateMaterialResponse;
  }
}
