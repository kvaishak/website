import { useState, useEffect } from "react";

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

function useCurrentWidth() {
  // save current window width in the state object
  let [width, setWidth] = useState();

  // in this case useEffect -> simulates component mount.
  useEffect(() => {
    let timeoutId = null;
    const resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWidth(getWidth()), 150);
    };

    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return width;
}

export default useCurrentWidth;
