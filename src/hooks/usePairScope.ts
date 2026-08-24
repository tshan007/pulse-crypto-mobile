import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { PairScope, useSubscriptionStore } from "../store/subscriptionStore";

/** Declares the pairs a screen needs live data for while it's focused (reacts to focus, not just mount, since tab/stack screens stay mounted). */
export function usePairScope(scope: PairScope) {
  const setPairScope = useSubscriptionStore((s) => s.setPairScope);
  const key = Array.isArray(scope) ? scope.join(",") : scope;

  useFocusEffect(
    useCallback(() => {
      setPairScope(scope);
      // scope excluded on purpose — key is its stable primitive form.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPairScope, key])
  );
}
