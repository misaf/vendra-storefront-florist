// Design-sync bundle entry: the storefront's shared UI kit, as one module.
// SafeImage (next/image) and ShareButton (next-intl context) are left out -
// they only run inside the Next app. See .design-sync/NOTES.md.
export * from "../src/shared/components/ui/alert";
export * from "../src/shared/components/ui/badge";
export * from "../src/shared/components/ui/button";
export * from "../src/shared/components/ui/card";
export * from "../src/shared/components/ui/carousel";
export * from "../src/shared/components/ui/command";
export * from "../src/shared/components/ui/dialog";
export * from "../src/shared/components/ui/dropdown-menu";
export * from "../src/shared/components/ui/empty";
export * from "../src/shared/components/ui/error-state";
export * from "../src/shared/components/ui/form";
export * from "../src/shared/components/ui/input";
export * from "../src/shared/components/ui/label";
export * from "../src/shared/components/ui/sheet";
export * from "../src/shared/components/ui/skeleton";
export * from "../src/shared/components/ui/social-icons";
export * from "../src/shared/components/ui/sonner";
export * from "../src/shared/components/ui/tabs";
export * from "../src/shared/components/ui/textarea";
// The imperative half of Toaster: toasts only reach a Toaster that shares
// this sonner instance, so it ships from the same bundle.
export { toast } from "sonner";
