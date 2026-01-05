/**
 * Geocoding utilities using Nominatim (OpenStreetMap's free geocoding service)
 * Rate limited to 1 request per second to respect Nominatim's usage policy
 */

/**
 * Parse comma-separated location string into array of place names
 * @param {string} locationString - e.g., "Paris, Lyon, Nice"
 * @returns {string[]} - e.g., ["Paris", "Lyon", "Nice"]
 */
function parseLocations(locationString) {
  if (!locationString || typeof locationString !== 'string') {
    return [];
  }

  return locationString
    .split(',')
    .map(loc => loc.trim())
    .filter(loc => loc.length > 0);
}

/**
 * Geocode a single location using Nominatim API
 * @param {string} place - Location name to geocode
 * @returns {Promise<{place: string, lat: number|null, lng: number|null, failed: boolean}>}
 */
async function geocodeLocation(place) {
  try {
    // Nominatim API endpoint
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Travel-Map-Website/1.0', // Nominatim requires a user agent
      },
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for "${place}": HTTP ${response.status}`);
      return { place, lat: null, lng: null, failed: true };
    }

    const data = await response.json();

    if (data.length === 0) {
      console.warn(`No results found for location: "${place}"`);
      return { place, lat: null, lng: null, failed: true };
    }

    const { lat, lon } = data[0];
    console.log(`✓ Geocoded "${place}": ${lat}, ${lon}`);

    return {
      place,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      failed: false,
    };
  } catch (error) {
    console.error(`Error geocoding "${place}":`, error.message);
    return { place, lat: null, lng: null, failed: true };
  }
}

/**
 * Add a delay to respect Nominatim's rate limit (1 request per second)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode all travels with location data
 * Rate limited to 1 request per second
 * @param {Array} travels - Array of travel objects with location property
 * @returns {Promise<Array>} - Travels with added coordinates property
 */
export async function geocodeTravels(travels) {
  const travelsWithCoordinates = [];

  for (const travel of travels) {
    // Create a copy of the travel object
    const enhancedTravel = { ...travel, coordinates: [] };

    if (!travel.location || typeof travel.location !== 'string') {
      travelsWithCoordinates.push(enhancedTravel);
      continue;
    }

    // Parse location string into individual places
    const places = parseLocations(travel.location);

    if (places.length === 0) {
      travelsWithCoordinates.push(enhancedTravel);
      continue;
    }

    console.log(`Geocoding ${places.length} location(s) for travel: "${travel.title}"`);

    // Geocode each place with rate limiting
    for (let i = 0; i < places.length; i++) {
      const place = places[i];

      // Add delay before request (except for the first one)
      if (i > 0) {
        await delay(1100); // 1.1 seconds to be safe with rate limits
      }

      const coord = await geocodeLocation(place);
      enhancedTravel.coordinates.push(coord);
    }

    travelsWithCoordinates.push(enhancedTravel);
  }

  // Log summary
  const totalCoords = travelsWithCoordinates.reduce((sum, t) => sum + t.coordinates.length, 0);
  const successfulCoords = travelsWithCoordinates.reduce(
    (sum, t) => sum + t.coordinates.filter(c => !c.failed).length,
    0
  );

  console.log(`Geocoding complete: ${successfulCoords}/${totalCoords} locations successfully geocoded`);

  return travelsWithCoordinates;
}
