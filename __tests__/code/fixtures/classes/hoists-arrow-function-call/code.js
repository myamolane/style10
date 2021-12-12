import style9 from 'style10';
const styles = style9.create({
  default: {
    color: 'blue'
  }
});
const get = state => styles(state() && 'default');
