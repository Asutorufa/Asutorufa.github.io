type PrismGlobal = {
  manual?: boolean;
};

const globalPrism = globalThis as typeof globalThis & { Prism?: PrismGlobal };
globalPrism.Prism = {
  ...globalPrism.Prism,
  manual: true
};
