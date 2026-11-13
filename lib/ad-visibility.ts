// A page can request analytics only after continuous foreground visibility.
export function observeAdVisibility(element: Element, onVisible: () => void) {
  if (typeof IntersectionObserver === "undefined") return () => {};
  let visible = false;
  let sent = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function update() {
    clearTimeout(timer);
    if (!sent && visible && document.visibilityState === "visible") {
      timer = setTimeout(() => {
        sent = true;
        onVisible();
      }, 1000);
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries.some(
        (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5,
      );
      update();
    },
    { threshold: [0, 0.5] },
  );
  observer.observe(element);
  document.addEventListener("visibilitychange", update);
  return () => {
    clearTimeout(timer);
    observer.disconnect();
    document.removeEventListener("visibilitychange", update);
  };
}
