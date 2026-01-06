import React from 'react';
import styles from './TravelStats.module.css';

/**
 * Calculate statistics from travels data
 */
function calculateStats(travels) {
  if (!travels || travels.length === 0) {
    return {
      totalTrips: 0,
      totalCountries: 0,
      yearsSpan: '',
      latestTrip: null,
    };
  }

  // Total trips
  const totalTrips = travels.length;

  // Unique countries
  const countriesSet = new Set();
  travels.forEach(travel => {
    if (travel.countries && Array.isArray(travel.countries)) {
      travel.countries.forEach(country => countriesSet.add(country));
    }
  });
  const totalCountries = countriesSet.size;

  // Years span
  const years = travels
    .filter(t => t.year)
    .map(t => t.year)
    .sort((a, b) => a - b);
  const yearsSpan = years.length > 0
    ? years[0] === years[years.length - 1]
      ? `${years[0]}`
      : `${years[0]} - ${years[years.length - 1]}`
    : '';

  // Latest trip (most recent by start date)
  const sortedByDate = [...travels]
    .filter(t => t.startDate)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const latestTrip = sortedByDate[0] || null;

  return {
    totalTrips,
    totalCountries,
    yearsSpan,
    latestTrip,
  };
}

const TravelStats = ({ travels }) => {
  const stats = calculateStats(travels);

  if (stats.totalTrips === 0) {
    return null;
  }

  return (
    <div className={styles.statsContainer}>
      <div className={styles.stat}>
        <div className={styles.statValue}>{stats.totalTrips}</div>
        <div className={styles.statLabel}>Trips</div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statValue}>{stats.totalCountries}</div>
        <div className={styles.statLabel}>Countries</div>
      </div>

      {stats.yearsSpan && (
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.yearsSpan}</div>
          <div className={styles.statLabel}>Years</div>
        </div>
      )}

      {stats.latestTrip && (
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.latestTrip.title}</div>
          <div className={styles.statLabel}>Latest Trip</div>
        </div>
      )}
    </div>
  );
};

export default TravelStats;
