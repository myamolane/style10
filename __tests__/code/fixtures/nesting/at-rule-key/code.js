import style9 from 'style100';
const styles = style9.create({
  default: {
    '@media': {
      '(max-width: 1000px)': {
        opacity: 1,
        '@media': {
          '(max-width: 1000px)': {
            opacity: 1
          }
        }
      }
    }
  }
});
styles.default;
