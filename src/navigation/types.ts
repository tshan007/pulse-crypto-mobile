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

// Kept for now: the Detail screen still reads params via this shape when
// nested inside MarketsStack. Re-exported so existing screen files don't
// need their import paths touched.
export type RootStackParamList = MarketsStackParamList;
