export const STATION_KEY = "tubeStation";
export const DIRECTION_KEY = "tubeDirection";
export const LINE_KEY = "tubeLine";

export default {
    isConfigured() {
        return window.localStorage.getItem(STATION_KEY) !== null && window.localStorage.getItem(DIRECTION_KEY) !== null
    },
    getStation() {
        return window.localStorage.getItem(STATION_KEY);
    },
    getDirection() {
        return window.localStorage.getItem(DIRECTION_KEY);
    },
    getLine() {
        return window.localStorage.getItem(LINE_KEY);
    },
    setStation(station) {
        window.localStorage.setItem(STATION_KEY, station);
    },
    setDirection(direction) {
        window.localStorage.setItem(DIRECTION_KEY, direction);
    },
    setLine(line) {
        window.localStorage.setItem(LINE_KEY, line);
    },
    reset() {
        window.localStorage.clear();
    }
}