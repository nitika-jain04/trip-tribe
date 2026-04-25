import { useState, useCallback, useMemo } from "react";

export function useCompare(trips = []) {
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialChoiceMade, setInterstitialChoiceMade] = useState(false);
  const [showLandscapeAlert, setShowLandscapeAlert] = useState(false);

  const triggerCompare = useCallback(() => {
    if (window.innerWidth < 768) {
      setShowLandscapeAlert(true);
      setTimeout(() => {
        setShowLandscapeAlert(false);
        setShowCompare(true);
      }, 5000);
    } else {
      setShowCompare(true);
    }
  }, []);

  const toggleCompare = useCallback((tripId) => {
    setCompareList((prev) => {
      const isAdding = !prev.includes(tripId);
      if (isAdding && prev.length < 3) {
        if (prev.length + 1 === 3) {
          triggerCompare();
        } else if (prev.length + 1 === 2) {
          setInterstitialChoiceMade(false);
          setShowInterstitial(true);
        }
      }
      return isAdding
        ? prev.length < 3
          ? [...prev, tripId]
          : prev
        : prev.filter((id) => id !== tripId);
    });
  }, [triggerCompare]);

  const compareTrips = useMemo(
    () => trips.filter((t) => compareList.includes(t.id)),
    [trips, compareList],
  );

  return {
    compareList,
    setCompareList,
    showCompare,
    setShowCompare,
    showInterstitial,
    setShowInterstitial,
    interstitialChoiceMade,
    setInterstitialChoiceMade,
    showLandscapeAlert,
    triggerCompare,
    toggleCompare,
    compareTrips,
  };
}
