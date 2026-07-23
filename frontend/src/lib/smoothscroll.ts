export const scrollToSection = (
  selector: string,
  offset = -80
) => {
  const element = document.querySelector(selector);

  if (!element) return;

  // @ts-ignore
  if (window.lenis) {
    // @ts-ignore
    window.lenis.scrollTo(element, {
      offset,
      duration: 1.2,
      immediate: false,
    });
  } else {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};