function detectImportedPackageName(path, state, babel) {
  const { types: t } = babel;
  if (!t.isLiteral(path.node.source, { value: 'style9' })) {
    return;
  }

  path.node.specifiers.forEach(specifier => {
    if (!t.isImportSpecifier(specifier)) {
      return;
    }
    // debug:setLocalName
    if (specifier.local.name !== specifier.imported.name) {
      state.file.metadata.localName = specifier.local.name;
    }
  });
}

module.exports = {
  detectImportedPackageName
};
