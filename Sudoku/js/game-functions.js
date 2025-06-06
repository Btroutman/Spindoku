 export const attachClickEvent = (selector, handler) => {
    const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
    if (element) element.addEventListener('click', handler);
};