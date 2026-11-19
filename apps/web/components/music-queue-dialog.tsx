import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, ListMusic, ListPlus, Search } from "lucide-react";
import { useRef, useState } from "react";

import {
  FORM_DIALOG_CONTENT,
  FormDialogFooter,
  FormDialogHeader,
  IconField,
  OrDivider,
} from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { musicQueueQueryKey } from "@/hooks/use-music-queue";
import { apiClient } from "@/lib/api-client";
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from "@/lib/styles";
import { cn } from "@/lib/utils";

import LoadingSpinner from "./loading-spinner";
import { toast } from "./ui/toast";

export function MusicQueueDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [noInputProvidedError, setNoInputProvidedError] = useState(false);

  const { mutateAsync: addSong, isPending: isAddingSong } = useMutation({
    mutationFn: async (input: { title?: string; url?: string }) => {
      return apiClient.api.music["add-song"].post(input);
    },
  });

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    if (trimmedTitle === "" && trimmedUrl === "") {
      setNoInputProvidedError(true);
      return;
    }
    setNoInputProvidedError(false);

    const { error: addSongError } = await addSong({
      title: trimmedTitle || undefined,
      url: trimmedUrl || undefined,
    });

    setIsOpen(false);

    if (addSongError) {
      toast.add({
        title: addSongError.status + " Fehler beim Hinzufügen des Songs",
        description: addSongError.value.message,
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: musicQueueQueryKey });
    setTitle("");
    setUrl("");

    toast.add({
      title: "Song erfolgreich hinzugefügt",
      description: "Der Song wurde auf die Warteschlange gesetzt.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            className={cn(OUTLINE_BUTTON, "shrink-0")}
            variant="outline"
            type="button"
          >
            <ListPlus />
            Song hinzufügen
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
            Icon={ListMusic}
            eyebrow="Bonsai FM"
            title="Song hinzufügen"
          >
            Gib den Namen oder den YouTube-Link des Songs an. Er wird hinten an
            die Warteschlange angehängt.
          </FormDialogHeader>
          <div className="relative flex flex-col gap-4">
            <IconField
              id="song-title"
              ref={firstFieldRef}
              label="Song-Name"
              Icon={Search}
              aria-invalid={noInputProvidedError}
              name="song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bohemian Rhapsody"
            />
            <OrDivider />
            <IconField
              id="song-link"
              label="YouTube-Link"
              Icon={Link2}
              href="https://www.youtube.com/"
              hrefLabel="YouTube"
              aria-invalid={noInputProvidedError}
              name="song-link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=fJ9rUzIMcZQ"
            />
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
              disabled={isAddingSong}
            >
              {isAddingSong ? (
                <LoadingSpinner message="Wird hinzugefügt..." />
              ) : (
                <>
                  <ListPlus />
                  Zur Warteschlange
                </>
              )}
            </Button>
          </FormDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
