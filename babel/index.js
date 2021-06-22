const Module = require('@linaria/babel-preset/lib/module').default;
const NAME = require('../package.json').name;
const processReferences = require('../src/process-references.js');
const { expCache } = require('../src/exp-cache');
const {
  detectImportedPackageName
} = require('./visitors/detectImportedPackageName');
const collectImportData = require('./visitors/collectImportData');
const { evalBindExps } = require('./ast/preval');

function generateCss(state, babel) {
  state.queue.forEach(item => {
    const { bindings } = item;

    const css = processReferences(bindings, state.opts, state, babel).join('');
    if (!state.file.metadata.style9) {
      state.file.metadata.style9 = '';
    }
    state.file.metadata.style9 += css;
  });
}

module.exports = function style9BabelPlugin(babel, options) {
  return {
    name: NAME,
    visitor: {
      Program: {
        enter(p, state) {
          state.queue = [];
          state.fileVarMap = {};
          state.deps = [];
          state.dependencies = [];

          Module.invalidate();

          p.traverse({
            ImportDefaultSpecifier(path) {
              collectImportData(path, state, babel, options);
            },
            ImportDeclaration(path) {
              detectImportedPackageName(path, state, babel);
            }
          });

          evalBindExps(p, state, babel, options);

          generateCss(state, babel);
        },
        exit() {
          // Invalidate cache for module evaluation when we're done
          Module.invalidate();
          expCache.clear();
        }
      }
    }
  };
};
