import type { PrintProvider } from "./interface";
import { SuzuriPrintProvider } from "./suzuri";
import { StubPrintProvider } from "./stub";

export type {
  PrintItem,
  PrintOrderInput,
  PrintOrderItemResult,
  PrintOrderResult,
  PrintProvider,
} from "./interface";

let cached: PrintProvider | undefined;
let cachedName: string | undefined;

export function getPrintProvider(): PrintProvider {
  const name = process.env.PRINT_PROVIDER ?? "suzuri";
  if (cached && cachedName === name) return cached;

  switch (name) {
    case "stub": {
      cached = new StubPrintProvider();
      cachedName = name;
      return cached;
    }
    case "suzuri": {
      const token = process.env.SUZURI_API_TOKEN;
      if (!token) {
        throw new Error("SUZURI_API_TOKEN is required for PRINT_PROVIDER=suzuri");
      }
      cached = new SuzuriPrintProvider(token);
      cachedName = name;
      return cached;
    }
    default:
      throw new Error(`Unknown PRINT_PROVIDER: ${name}`);
  }
}
