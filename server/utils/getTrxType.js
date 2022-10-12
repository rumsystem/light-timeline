module.exports = (item) => {
  if (item.Data.type === 'Note' && !item.Data.inreplyto) {
    return 'post';
  }
  if (item.Data.type === 'Note' && !!item.Data.inreplyto) {
    return 'comment';
  }
  if (['Like', 'Dislike'].includes(item.Data.type)) {
    return 'counter';
  }
  if (Object.keys(item.Data).includes('name') || Object.keys(item.Data).includes('image')) {
    return 'profile';
  }
};