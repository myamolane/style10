/* eslint-env jest */
const compile = require('../compile.js');

it('generates keyframes', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  '0%': {
    color: 'blue'
  },
  '100%': {
    color: 'red'
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe('@keyframes c14ueipo{0%{color:blue}100%{color:red}}');
});

it('removes empty frame', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  '0%': {
    color: 'blue'
  },
  '100%': {
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe('@keyframes clbvhnp{0%{color:blue}}');
});

it('converts from', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  from: {
    color: 'blue'
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe('@keyframes clbvhnp{0%{color:blue}}');
});

it('converts to', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  to: {
    color: 'blue'
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe('@keyframes c1yehff3{100%{color:blue}}');
});

it('expands shorthand', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  '0%': {
    padding: '1rem',
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe(
    '@keyframes cltlz9e{0%{' +
      'padding-top:1rem;' +
      'padding-right:1rem;' +
      'padding-bottom:1rem;' +
      'padding-left:1rem' +
      '}}'
  );
});

it('keeps longhand', () => {
  const input = `
import style9 from 'style10';
style9.keyframes({
  '0%': {
    padding: '1rem',
    paddingLeft: '2rem'
  }
});
  `;
  const { styles } = compile(input);

  expect(styles).toBe(
    '@keyframes culjx28{0%{' +
      'padding-top:1rem;' +
      'padding-right:1rem;' +
      'padding-bottom:1rem;' +
      'padding-left:2rem' +
      '}}'
  );
});
