import style9 from 'style100';
const styles = style9.create({
  default: {
    '::before': {
      opacity: 1
    }
  },
  hidden: {
    '::before': {
      opacity: 0
    }
  }
});
styles('default', 'hidden');
