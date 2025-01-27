import type { OptionsType } from "cookies-next";
import { getCookies as cnGetCookies, setCookie } from "cookies-next";
import ms from "ms";
import { snapshot, subscribe } from "valtio";
import { omit } from "lodash-es";

export default function createStateHydration<T extends object>(
  cookieName: string,
  state: T,
  properties?: (keyof T)[],
) {
  const retypedState = state as {
    _hydration?: number;
  };

  if (!retypedState._hydration) {
    subscribe(state, () => {
      setCookie(
        cookieName,
        omit(snapshot(retypedState), [
          "_hydration",
          ...Object.keys(retypedState).filter(
            (p) => properties && !properties.includes(p as keyof T),
          ),
        ]),
        {
          maxAge: ms("30d"),
          path: "/",
        },
      );
    });
  }

  return function hydrate(cookies?: object) {
    const retypedCookies = cookies as
      | {
          _lastUpdate?: string;
        }
      | undefined;
    if (
      !retypedCookies?._lastUpdate ||
      !retypedState._hydration ||
      retypedState._hydration < +retypedCookies._lastUpdate
    ) {
      retypedState._hydration = retypedCookies?._lastUpdate
        ? +retypedCookies._lastUpdate
        : Date.now();

      if (cookies?.[cookieName as keyof typeof cookies]) {
        try {
          const cookieValueString = cookies[
            cookieName as keyof typeof cookies
          ] as string;
          const cookieValue = JSON.parse(cookieValueString);
          if (typeof cookieValue === "object") {
            for (const property of properties || Object.keys(state)) {
              if (cookieValue[property]) {
                state[property as keyof typeof state] = cookieValue[property];
              }
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // do nothing
        }
      }
    }
  };
}

export const getCookies = async (options?: OptionsType) =>
  ({
    ...(await cnGetCookies(options)),
    _lastUpdate: Date.now().toString(),
  }) as Record<string, string>;
