export type MarketsStackParamList = {
  Watchlist: undefined;
  Detail: { pair: string };
};

export type RootTabParamList = {
  Terminal: undefined;
  MarketsStack: undefined;
  Telemetry: undefined;
  Settings: undefined;
};

// Alias so screen files nested inside MarketsStack don't need their import paths touched.
export type RootStackParamList = MarketsStackParamList;
