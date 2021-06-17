const NAME = require('../../package.json').name;
const { isPropertyCall } = require('../../src/utils/ast');
const { ValueType } = require('../../src/utils/constants');

/**
 * Hoist the node and its dependencies to the highest scope possible
 */

function hoist(babel, ex) {
  const Identifier = idPath => {
    if (!idPath.isReferencedIdentifier()) {
      return;
    }
    const binding = idPath.scope.getBinding(idPath.node.name);
    if (!binding) return;
    const { scope, path: bindingPath, referencePaths } = binding;
    // parent here can be null or undefined in different versions of babel
    if (!scope.parent) {
      // It's a variable from global scope
      return;
    }

    if (bindingPath.isVariableDeclarator()) {
      const initPath = bindingPath.get('init');
      hoist(babel, initPath);
      initPath.hoist(scope);
      if (initPath.isIdentifier()) {
        referencePaths.forEach(referencePath => {
          referencePath.replaceWith(babel.types.identifier(initPath.node.name));
        });
      }
    }
  };

  if (ex.isIdentifier()) {
    return Identifier(ex);
  }

  ex.traverse({
    Identifier
  });
}

function collectDepsFromExp(path, state, babel) {
  const { types: t } = babel;
  const { value, confident } = path.evaluate();
  if (confident) {
    return { kind: ValueType.VALUE, value, source: path };
  }

  const originalExNode = t.cloneNode(path.node);

  hoist(babel, path);

  // save hoisted expression to be used to evaluation
  const hoistedExNode = t.cloneNode(path.node);

  // get back original expression to the tree
  path.replaceWith(originalExNode);
  return {
    kind: ValueType.LAZY,
    ex: hoistedExNode,
    originalEx: path,
    source: path
  };
}

function collectDepsFromCreate(identifier, state, babel, options) {
  const callExpr = identifier.parentPath.parentPath;
  const objExpr = callExpr.get('arguments.0');
  const deps = collectDepsFromExp(objExpr, state, babel, options);
  return deps;
}

function collectDepsFromRef(node, state, babel, options) {
  let deps = [];
  if (node.parentPath.isCallExpression()) deps = [];

  if (isPropertyCall(node, 'create')) {
    deps = [collectDepsFromCreate(node, state, babel, options)];
  }

  state.deps.push({
    path: node,
    expressionValues: deps
  });
  // if (isPropertyCall(node, 'keyframes')) return transpileKeyframes(node);
}

function collectDepsFromRefs(refs, state, babel, options) {
  const result = refs.flatMap(ref =>
    collectDepsFromRef(ref, state, babel, options)
  );
  return result;
}

function collectImportData(path, state, babel, options) {
  if (path.parent.source.value !== NAME) return;
  const importName = path.node.local.name;
  // foreach binds & not absolute
  // reference from taggedTemplate
  const bindings = path.scope.bindings[importName].referencePaths;

  collectDepsFromRefs(bindings, state, babel, options);

  state.queue.push({
    // importName,
    bindings
  });
}

module.exports = collectImportData;
