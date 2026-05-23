import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  badge?: string;
  selected?: boolean;
  starred?: boolean;
};

export function PhotoTile({
  src,
  alt = "",
  badge,
  selected,
  starred,
}: Props) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-lg border ${
        selected ? "border-orange-500 ring-2 ring-orange-200" : "border-stone-200"
      } bg-stone-100`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 200px"
        className="object-cover"
      />
      {starred && (
        <span className="absolute left-1 top-1 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
          ★
        </span>
      )}
      {selected && (
        <span className="absolute right-1 top-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          ✓
        </span>
      )}
      {badge && (
        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          {badge}
        </span>
      )}
    </div>
  );
}
