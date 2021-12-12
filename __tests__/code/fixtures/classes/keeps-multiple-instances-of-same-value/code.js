import style9 from 'style100';
const styles = style9.create({
  default: {
    color: 'blue'
  },
  blue: {
    color: 'blue'
  }
});
styles(false && 'default', true && 'blue');
