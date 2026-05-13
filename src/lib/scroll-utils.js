import { animate } from "framer-motion";

export const animatedScrollTo = (targetY, duration = 600) => {
  const startY = window.scrollY;
  // Use framer-motion's animate for a silky smooth feel
  animate(startY, targetY, {
    duration: duration / 1000,
    ease: [0.25, 1, 0.5, 1], // Very slow and gentle smooth ease out
    onUpdate: (latest) => {
      window.scrollTo({ top: latest, behavior: "instant" });
    },
  });
};
