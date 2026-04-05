declare module "use-sound" {
  import { HookOptions, ReturnedValue } from "use-sound/dist/types";

  export default function useSound(
    src: string | string[],
    options?: HookOptions,
  ): ReturnedValue;
}