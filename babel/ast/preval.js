const expression = require('@babel/template').expression;
const statement = require('@babel/template').statement;
const generator = require('@babel/generator').default;
const evaluate = require('@linaria/babel-preset/lib/evaluators').default;
const { expCache } = require('../../src/exp-cache');
const { ValueType } = require('../../src/utils/constants');

function isLazyValue(v) {
  return v.kind === ValueType.LAZY;
}

function findFreeName(scope, name) {
  // By default `name` is used as a name of the function …
  let nextName = name;
  let idx = 0;
  while (scope.hasBinding(nextName, false)) {
    // … but if there is an already defined variable with this name …
    // … we are trying to use a name like wrap_N
    idx += 1;
    nextName = `wrap_${idx}`;
  }

  return nextName;
}

// All exported values will be wrapped with this function
const expressionWrapperTpl = statement(`
  const %%wrapName%% = (fn) => {
    try {
      return fn();
    } catch (e) {
      return e;
    }
  };
`);

const exportsLinariaPrevalTpl = statement(
  `exports.__linariaPreval = %%expressions%%`
);

const expressionTpl = expression(`%%wrapName%%(() => %%expression%%)`);

function addPreval(path, lazyDeps, { types: t }) {
  // Constant __linariaPreval with all dependencies
  const wrapName = findFreeName(path.scope, '_wrap');
  const statements = [
    expressionWrapperTpl({ wrapName }),
    exportsLinariaPrevalTpl({
      expressions: t.arrayExpression(
        lazyDeps.map(expression => expressionTpl({ expression, wrapName }))
      )
    })
  ];

  const programNode = path.node;
  return t.program(
    [...programNode.body, ...statements],
    programNode.directives,
    programNode.sourceType,
    programNode.interpreter
  );
}

function isNodePath(obj) {
  return 'node' in obj && obj && obj.node !== undefined;
}

function unwrapNode(item) {
  if (typeof item === 'string') {
    return item;
  }

  return isNodePath(item) ? item.node : item;
}

function evalBindExps(path, state, babel, options) {
  const deps = state.deps.reduce((acc, { expressionValues: values }) => {
    acc.push(...values);
    return acc;
  }, []);

  const lazyDeps = deps.filter(isLazyValue);

  // lazyDeps[index]source
  const expressionsToEvaluate = lazyDeps.map(v => unwrapNode(v.ex));
  // const originalLazyExpressions = lazyDeps.map(v =>
  //   unwrapNode(v.originalEx)
  // );
  let lazyValues = [];

  if (expressionsToEvaluate.length > 0) {
    const program = addPreval(path, expressionsToEvaluate, babel);
    const { code } = generator(program);
    const evaluation = evaluate(code, state.file.opts.filename, options);
    state.dependencies.push(...evaluation.dependencies);
    // [index] => value
    lazyValues = evaluation.value.__linariaPreval || [];
    lazyDeps.forEach((item, idx) => {
      expCache.set(item.source, lazyValues[idx]);
    });
  }
}

module.exports = {
  addPreval,
  unwrapNode,
  evalBindExps
};
