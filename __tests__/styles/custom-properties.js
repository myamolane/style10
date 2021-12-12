/* eslint-env jest */
const compile = require('../compile.js');

it('does not convert number', () => {
  const input = `
import style9 from 'style100';
const styles = style9.create({
  default: {
    '--opacity': 1
  }
});
styles('default');
  `;
  const { styles } = compile(input);

  expect(styles).toBe('.c1tldmpg{--opacity:1}');
});

it('does not change capitalization', () => {
  const input = `
import style9 from 'style100';
const styles = style9.create({
  default: {
    '--backgroundColor': 'red'
  }
});
styles('default');
  `;
  const { styles } = compile(input);

  expect(styles).toBe('.c1wvjxbo{--backgroundColor:red}');
});
