// Use Windy's native below-timeline slot on phones; preserve the desktop portal.
export function mountControllerDock(controls) {
  const mobile = window.matchMedia('(max-width:600px)');
  let frame = 0, dead = false;
  function place() {
    frame = 0; if (dead) return;
    const host = mobile.matches ? document.querySelector('#bottom-wrapper') : null;
    const slot = host?.querySelector('[data-plugin="bottom-below-controls-mobile"]');
    const parent = host || document.body;
    controls.classList.toggle('mobile-docked', !!host);
    if (slot) {
      if (controls.parentElement !== parent || slot.nextElementSibling !== controls) slot.insertAdjacentElement('afterend', controls);
    } else if (controls.parentElement !== parent) parent.appendChild(controls);
  }
  function schedule() { if (!dead && !frame) frame = requestAnimationFrame(place); }
  const observer = new MutationObserver(schedule);
  place();
  observer.observe(document.body, { childList: true, subtree: true });
  mobile.addEventListener('change', schedule);
  return () => {
    dead = true; observer.disconnect(); mobile.removeEventListener('change', schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}
