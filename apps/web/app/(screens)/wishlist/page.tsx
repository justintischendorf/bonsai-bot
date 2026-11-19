"use client";

import { Ghost } from "ghostlyjs";

import { BonsaiLogo } from "@/components/bonsai-logo";
import { Separator } from "@/components/ui/separator";
import { WishlistEmptyCard } from "@/components/wishlist-empty-card";
import WishlistItemCard from "@/components/wishlist-item-card";
import { WishlistItemDialog } from "@/components/wishlist-item-dialog";
import { useWishlist } from "@/hooks/use-wishlist";

const FIRST_ROW_SIZE = 4;

export default function Wishlist() {
  const { data: wishlistResponse, isLoading: isWishlistLoading } =
    useWishlist();
  const wishlistItems = wishlistResponse?.data?.server;

  return (
    <div className="flex flex-col gap-5 px-4 sm:px-8 xl:px-20">
      <div className="flex min-w-0 items-center gap-4">
        <BonsaiLogo className="size-14 shrink-0 sm:size-16" />
        <h1 className="text-3xl font-bold uppercase text-bonsai-pot-light min-[375px]:text-4xl sm:text-5xl">
          Wunschliste
        </h1>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <p className="max-w-3xl text-lg leading-relaxed text-pretty text-bonsai-pot [&_strong]:font-bold [&_strong]:text-bonsai-leaf-light">
          Hier findest du alle <strong>Spiele</strong>, die auf deiner
          Wunschliste stehen. Füge neue hinzu, indem du den Link von{" "}
          <strong>Steam</strong>, <strong>Instant Gaming</strong> oder dem{" "}
          <strong>PlayStation Store</strong> angibst, oder entferne Spiele, die
          du nicht mehr brauchst.
        </p>
        <WishlistItemDialog />
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Ghost name="wishlist-items" isLoading={isWishlistLoading} count={8}>
          {wishlistItems?.map((item, index) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              imageLoading={index < FIRST_ROW_SIZE ? "eager" : "lazy"}
            />
          ))}
        </Ghost>
      </div>
      {wishlistItems?.length === 0 && !isWishlistLoading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <WishlistEmptyCard />
        </div>
      )}
    </div>
  );
}
