import Image from "next/image";

import bonsaiBotTitle from "@/assets/logos/bonsai-bot-title.svg";
import { BonsaiLogo } from "@/components/bonsai-logo";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_35%_40%_at_50%_40%,--theme(--color-bonsai-leaf/18%),transparent)]"
      />
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <BonsaiLogo className="size-24 drop-shadow-[0_0_30px_#4ade8040]" />
          <Image
            loading="eager"
            className="h-auto w-64"
            src={bonsaiBotTitle}
            alt="Bonsai Bot"
            width={256}
          />
        </div>
        <LoginForm className="w-full" />
      </div>
    </div>
  );
}
