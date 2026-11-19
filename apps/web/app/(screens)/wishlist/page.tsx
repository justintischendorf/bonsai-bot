"use client";

import { Ghost } from "ghostlyjs";
import { Gamepad2 } from "lucide-react";

import { Divider, PageHeader } from "@/components/decor";
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
    <div className="flex flex-col gap-8 px-4 sm:px-8 xl:px-20">
      <PageHeader
        eyebrow="Spiele"
        title="Wunschliste"
        Icon={Gamepad2}
        actions={<WishlistItemDialog />}
      >
        Hier findest du alle <strong>Spiele</strong>, die auf deiner Wunschliste
        stehen. Füge neue hinzu, indem du den Link von <strong>Steam</strong>,{" "}
        <strong>Instant Gaming</strong> oder dem{" "}
        <strong>PlayStation Store</strong> angibst, oder entferne Spiele, die du
        nicht mehr brauchst.
      </PageHeader>
      <Divider />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
