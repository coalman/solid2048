module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        modules: false,
      },
    ],
    [
      "@babel/preset-typescript",
      {
        allExtensions: true,
        allowDeclareFields: true, // NOTE: will be true by default in Babel 8
        disallowAmbiguousJSXLike: true,
        onlyRemoveTypeImports: true,
      },
    ],
  ],
};
