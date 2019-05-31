import _ from "lodash";

class LocationUtils {
    static getLocationName(index, locationLevels) {
        return locationLevels[index].name;
    }

    static locationLevelByName(name, locationLevels) {
        return _.find(locationLevels, ['name', name]);
    }

    static parent(locationLevel, locationLevels) {
        const sortedLevels = this.sortLocationLevels(locationLevels, "asc");
        const parent = _.find(sortedLevels, (l) => l.level > locationLevel.level);
        return parent;
    }

    static areAtTheSameLevel(locationIds, allLocations) {
        const levels = allLocations.filter(l => _.includes(locationIds, l.id)).map(l => l.level);
        return levels.every(l => l === levels[0]);
    }

    static enableLocationInput(locations, locationLevel, locationLevels) {
        const parent = this.parent(locationLevel, locationLevels);
        if(!parent)
            return true;
        const enable = locations[parent.name].length === 1;
        console.log(`${locationLevel.name} < ${parent.name} ${enable}`);
        return enable;
    }

    static isLowestLevel(locationLevel, locationLevels) {
        console.assert(!_.isEmpty(locationLevels), "Location Levels should never be empty");
        if (locationLevels.length === 1)
            return true;
        const sortedLevels = this.sortLocationLevels(locationLevels);
        return _.last(sortedLevels).level === locationLevel.level;
    }

    static sortLocationLevels(locationLevels, order = "desc") {
        return _.orderBy(locationLevels, ['level'], [order]);
    }
}

export default LocationUtils;