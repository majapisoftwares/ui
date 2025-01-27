import { snapshot, subscribe } from "valtio";
import { omit } from "lodash-es";

export default function createLocalStorageStateHydration<T extends object>(
  localStorageName: string,
  state: T,
  properties?: (keyof T)[],
) {
  const retypedState = state as { _hydrated?: boolean };

  if (!retypedState._hydrated) {
    retypedState._hydrated = true;
    subscribe(state, () => {
      localStorage.setItem(
        localStorageName,
        JSON.stringify(
          omit(snapshot(retypedState), [
            "_hydrated",
            ...Object.keys(retypedState).filter(
              (p) => properties && !properties.includes(p as keyof T),
            ),
          ]),
        ),
      );
    });

    const hydratedState = localStorage.getItem(localStorageName);
    if (hydratedState) {
      Object.assign(retypedState, JSON.parse(hydratedState));
    }
  }
}
