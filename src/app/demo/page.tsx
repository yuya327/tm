import { Container } from "@/components/Container";
import { DemoForm } from "./DemoForm";

export default function DemoPage() {
  return (
    <Container>
      <h1 className="text-2xl font-bold">画像加工デモ</h1>
      <p className="mt-1 text-sm text-stone-600">
        1枚の写真をアップロード → スタイルを選んで加工。本番フローへの組み込み前の動作確認用。
      </p>
      <DemoForm />
    </Container>
  );
}
