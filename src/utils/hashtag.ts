export default (text: string, options?: { disabled: boolean }) => {
  if (!text) {
    return text;
  }
  const urlRegex = /#[^#\s]+[#\s]{0,1}/g;
  return text.replace(urlRegex, item => {
    try {
      if (item.trim().endsWith('"')) {
        return item;
      }
    } catch(_) {}
    return `<a class="text-sky-500" href="${item.replace(/\s/, '')}" ${options && options.disabled ? 'disabled' : ''}>${item}</a>`
  });
};
