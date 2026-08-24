import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { PairScope, useSubscriptionStore } from "../store/subscriptionStore";

/**
 * Declares the pairs a screen needs live data for while it's focused.
 * Tab/stack screens stay mounted across navigation (React Navigation doesn't
 * unmount them by default), so this has to react to focus, not just mount —
 * otherwise a screen's scope would only ever apply once, the first time it
 * was shown.
 */
export function usePairScope(scope: PairScope) {
  const setPairScope = useSubscriptionStore((s) => s.setPairScope);
  const key = Array.isArray(scope) ? scope.join(",") : scope;

  useFocusEffect(
    useCallback(() => {
      setPairScope(scope);
      // key is a stable primitive derived from scope; scope itself is
      // intentionally excluded so a new array literal each render doesn't
      // re-run this.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPairScope, key])
  );
}
