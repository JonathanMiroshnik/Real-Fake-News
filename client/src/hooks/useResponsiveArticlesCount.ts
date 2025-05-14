import { useState, useEffect } from "react";

export function useResponsiveArticlesCount() {
  const getCount = () => {
    const width = window.innerWidth;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;

    if (width <= 1000) {
      return isLandscape ? 2 : 1; // Example: 6 articles if landscape, 3 if portrait
    }
    return 4; // Default for tablets/desktops
  };

  const [articleCount, setArticleCount] = useState(getCount);

  useEffect(() => {
    const handleResize = () => {
      setArticleCount(getCount());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return articleCount;
}
