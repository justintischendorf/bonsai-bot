import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Gamepad2, ListPlus, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  FORM_DIALOG_CONTENT,
  FormDialogFooter,
  FormDialogHeader,
  IconField,
} from "@/components/form-dialog";
import {
  InstantGamingLogo,
  PlayStationLogo,
  SteamLogo,
} from "@/components/shop-logos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { wishlistQueryKey } from "@/hooks/use-wishlist";
import { apiClient } from "@/lib/api-client";
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from "@/lib/styles";
import { cn } from "@/lib/utils";

import LoadingSpinner from "./loading-spinner";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "./ui/toast";

const CROSSPLAY_OPTIONS = [
  { value: "yes", label: "Ja", Icon: Check },
  { value: "no", label: "Nein", Icon: X },
];

export function WishlistItemDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [steamLink, setSteamLink] = useState("");
  const [instantGamingLink, setInstantGamingLink] = useState("");
  const [playstationLink, setPlaystationLink] = useState("");
  const [crossplayAvailable, setCrossplayAvailable] = useState(false);
  const [noLinkProvidedError, setNoLinkProvidedError] = useState(false);

  const { mutateAsync: addWishlistItem, isPending: isAddingWishlistItem } =
    useMutation({
      mutationFn: async (input: {
        steamLink: string;
        instantGamingLink: string;
        playstationLink: string;
        crossplayAvailable: boolean;
      }) => {
        return apiClient.api.wishlist.post(input);
      },
    });

  async function handleSubmit() {
    if (
      steamLink === "" &&
      instantGamingLink === "" &&
      playstationLink === ""
    ) {
      setNoLinkProvidedError(true);
      return;
    } else {
      setNoLinkProvidedError(false);
    }

    const { error: addWishlistItemError } = await addWishlistItem({
      steamLink,
      instantGamingLink,
      playstationLink,
      crossplayAvailable,
    });

    setIsOpen(false);

    if (addWishlistItemError) {
      toast.add({
        title:
          addWishlistItemError.status + " Fehler beim Hinzufügen des Spiels",
        description: addWishlistItemError.value.message,
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    setSteamLink("");
    setInstantGamingLink("");
    setPlaystationLink("");
    setCrossplayAvailable(false);

    toast.add({
      title: "Spiel erfolgreich hinzugefügt",
      description: "Das Spiel wurde auf die Wunschliste gesetzt.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            className={cn(PRIMARY_BUTTON, "w-full shrink-0 sm:w-auto")}
            variant="outline"
            type="button"
          >
            <ListPlus />
            Spiel hinzufügen
          </Button>
        }
      />
      <DialogContent
        className={FORM_DIALOG_CONTENT}
        initialFocus={firstFieldRef}
      >
        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FormDialogHeader
            Icon={Gamepad2}
            eyebrow="Wunschliste"
            title="Spiel hinzufügen"
          >
            Gib am besten die Links aller drei Stores an, dann vergleicht Bonsai
            die Preise und findet das{" "}
            <strong className="font-medium text-neutral-100">
              günstigste Angebot
            </strong>
            .
          </FormDialogHeader>
          <div className="relative flex flex-col gap-4">
            <IconField
              id="steam-link"
              ref={firstFieldRef}
              label="Steam"
              Icon={SteamLogo}
              href="https://store.steampowered.com/"
              hrefLabel="Store"
              aria-invalid={noLinkProvidedError}
              name="steam-link"
              value={steamLink}
              onChange={(e) => setSteamLink(e.target.value)}
              placeholder="https://store.steampowered.com/app/123456/example-game/"
            />
            <IconField
              id="instant-gaming-link"
              label="Instant Gaming"
              Icon={InstantGamingLogo}
              href="https://www.instant-gaming.com/"
              hrefLabel="Store"
              aria-invalid={noLinkProvidedError}
              name="instant-gaming-link"
              value={instantGamingLink}
              onChange={(e) => setInstantGamingLink(e.target.value)}
              placeholder="https://www.instant-gaming.com/de/1234-buy-example-game-steam-key-global/"
            />
            <IconField
              id="playstation-link"
              label="PlayStation Store"
              Icon={PlayStationLogo}
              href="https://store.playstation.com/de-de/pages/latest"
              hrefLabel="Store"
              aria-invalid={noLinkProvidedError}
              name="playstation-link"
              value={playstationLink}
              onChange={(e) => setPlaystationLink(e.target.value)}
              placeholder="https://store.playstation.com/de-de/concept/12345678"
            />
            <div className="flex flex-col gap-2">
              <Label id="crossplay-label" className="text-neutral-200">
                Crossplay
                <span className="text-xs font-normal text-neutral-500">
                  PlayStation 5 und PC
                </span>
              </Label>
              <RadioGroup
                aria-labelledby="crossplay-label"
                className="grid-cols-2"
                value={crossplayAvailable ? "yes" : "no"}
                onValueChange={(value) =>
                  setCrossplayAvailable(value === "yes")
                }
              >
                {CROSSPLAY_OPTIONS.map(({ value, label, Icon }) => (
                  <Label
                    key={value}
                    htmlFor={`crossplay-${value}`}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 font-normal text-neutral-300 transition-colors hover:border-white/20 has-data-checked:border-bonsai-leaf-light/60 has-data-checked:bg-bonsai-leaf/10 has-data-checked:text-white"
                  >
                    <RadioGroupItem
                      value={value}
                      id={`crossplay-${value}`}
                      className="data-checked:border-bonsai-leaf-light data-checked:bg-bonsai-leaf-light dark:data-checked:bg-bonsai-leaf-light"
                    />
                    <Icon className="size-4 text-neutral-500" />
                    {label}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <FormDialogFooter>
            <DialogClose
              render={
                <Button
                  className={OUTLINE_BUTTON}
                  variant="outline"
                  type="button"
                >
                  Abbrechen
                </Button>
              }
            />
            <Button
              className={PRIMARY_BUTTON}
              type="submit"
              disabled={isAddingWishlistItem}
            >
              {isAddingWishlistItem ? (
                <LoadingSpinner message="Wird hinzugefügt..." />
              ) : (
                <>
                  <ListPlus />
                  Auf die Wunschliste
                </>
              )}
            </Button>
          </FormDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
