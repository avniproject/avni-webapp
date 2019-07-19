import _ from "lodash";

class LocationUtils {
  static areAtTheSameLevel(locationIds, allLocations) {
    const levels = allLocations
      .filter(l => _.includes(locationIds, l.id))
      .map(l => l.level);
    return levels.every(l => l === levels[0]);
  }
}

export default LocationUtils;
