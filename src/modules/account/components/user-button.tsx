"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { UserPanel } from "./user-panel";
import { User } from "lucide-react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFocusReturn } from "@/shared/hooks/use-focus-return";

export function UserButton() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();
  const { capture, onCloseAutoFocus } = useFocusReturn();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-11"
        onClick={() => {
          capture();
          setOpen(true);
        }}
        aria-label={t("common.myAccount")}
      >
        <User className="h-5 w-5" />
      </Button>
      <UserPanel open={open} onOpenChange={setOpen} onCloseAutoFocus={onCloseAutoFocus} />
    </>
  );
}
