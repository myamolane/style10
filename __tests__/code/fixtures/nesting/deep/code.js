import style9 from 'style100';
const styles = style9.create({
  default: {
    '@media (max-width: 1000px)': {
      ':hover': {
        '::before': {
          opacity: 1
        }
      }
    }
  }
});
styles('default');
