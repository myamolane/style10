const { expCache } = require('../exp-cache');
const testASTShape = require('./test-ast-shape');

function evaluateNodePath(path) {
  const { value, confident, deopt } = path.evaluate();
  if (confident) return value;
  if (expCache.has(path)) {
    return expCache.get(path);
  }
  throw deopt.buildCodeFrameError('Could not evaluate value');
}

function isDynamicKey(memberExpr) {
  const property = memberExpr.get('property');

  return memberExpr.node.computed && !property.isLiteral();
}

function getStaticKey(memberExpr) {
  return memberExpr.node.property.name || memberExpr.node.property.value;
}

function isPropertyCall(node, name) {
  return testASTShape(node, {
    parent: {
      type: 'MemberExpression',
      parent: {
        type: 'CallExpression',
        callee: {
          property: { name }
        },
        arguments: {
          length: 1,
          0: {
            type: 'ObjectExpression'
          }
        }
      }
    }
  });
}

module.exports = {
  isDynamicKey,
  getStaticKey,
  evaluateNodePath,
  isPropertyCall
};
