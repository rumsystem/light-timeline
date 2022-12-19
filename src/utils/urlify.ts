export default (text: string, options?: { disabled: boolean }) => {
  if (!text) {
    return text;
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, `<a class="text-sky-400" href="$1" ${options && options.disabled ? 'disabled' : ''}>查看链接</a>`);
};
