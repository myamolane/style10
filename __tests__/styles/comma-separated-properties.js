/* eslint-env jest */
const compile = require('../compile.js');

it('handles properties wich can be defined as lists correctly', () => {
  const input = `
import style9 from 'style10';
const styles = style9.create({
  default: {
    transitionProperty: ['opacity', 'transform'],
    transitionDuration: ['200ms', '300ms', '400ms'],
    transitionDelay: ['100ms', '200ms', '300ms'],
    transitionTimingFunction: ['ease-in', 'ease-out', 'ease-in-out'],
    strokeDasharray: [10, 100, 200],
    scrollSnapType: ['none', 'mandatory'],
    scrollSnapAlign: ['start', 'end']
  }
});
styles('default');
  `;
  const { styles } = compile(input);

  expect(styles).toBe(
    '.cv51mu6{transition-property:opacity,transform}' +
      '.cnds6hw{transition-duration:200ms,300ms,400ms}' +
      '.cqiea9d{transition-delay:100ms,200ms,300ms}' +
      '.cqkqqd0{transition-timing-function:ease-in,ease-out,ease-in-out}' +
      '.cjcw4qf{stroke-dasharray:10 100 200}' +
      '.cnka3rw{scroll-snap-type:none mandatory}' +
      '.c1tczq9u{scroll-snap-align:start end}'
  );
});
