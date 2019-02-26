<template>
    <div id="setup">
        <h3>Setup Tube Board</h3>
        <form>
            <label>1. Select station</label>
            <div v-if="!station">
                <input v-model="stationQuery" @input="searchStations" type="text" placeholder="Search station name...">
                <ul v-if="stations && stations.length > 0">
                    <li v-for="station in stations" class="stationItem" @click="selectStation(station)">
                        {{station.name}}
                    </li>
                </ul>
            </div>
            <div v-else>
                <h3>{{station.name}}</h3>
                <label>2. Select line</label>
                <p v-if="loadingLines">Loading Tube lines...</p>
                <ul v-if="lines">
                    <li v-for="line in lines" class="stationItem" @click="selectLine(line)">{{line.name}}</li>
                </ul>
            </div>
            <div v-if="station && line">
                <label>3. Select direction</label>
                <select v-model="direction" @change="selectDirection">
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                </select>
            </div>
        </form>
        <div class="error" v-if="error">{{error}}</div>
        <div class="error" v-if="stations && stations.length === 0">No stations found.</div>
    </div>
</template>

<style>
    h3 {
        margin-top: 0.5em;
    }

    #setup {
        margin: 50px auto;
        max-width: 400px;
        padding: 20px;
        border-radius: 5px;
        border: 1px solid #3d3d3d;
        font-family: sans-serif;
    }

    input, select {
        width: 100%;
        display: block;
        padding: 5px;
    }

    ul {
        list-style: none;
        margin: 5px 0;
        padding: 0;
        border-radius: 4px;
        border: 1px solid #c5c5c5;
    }

    .stationItem {
        display: block;
        cursor: pointer;
        padding: 5px;
        border-bottom: 1px solid #c5c5c5;
    }

    .stationItem:last-of-type {
        border: none;
    }

    .error {
        background-color: #ff949f;
        color: #ff0000;
        border-radius: 5px;
        margin: 10px 0;
        padding: 5px;
    }
</style>

<script>
    import {client} from '../TflClient';
    import Config from '../Config';
    import axios from 'axios';

    function extractNaptan(station) {
        return new Promise((resolve, reject) => {
            /*We need a NAPTAN ID to query the arrivals. This should be in topMostParentId.
                If this is missing, the station is a "HUB". Therefore we need to query the actual Tube stops associated with it*/
            if ('topMostParentId' in station) {
                //Crack on
                resolve(station.topMostParentId);
            } else {
                //This endpoint refuses to take credentials, so just a blank Axios request
                client.getNoCredentials('StopPoint/' + station.id, {
                    includeCrowdingData: false
                }).then(response => {
                    //Under `children` will be StopPoints
                    //We need to find the one that has Tube mode
                    let filteredStops = response.data.children.filter((stopPoint) => stopPoint.modes.indexOf('tube') !== -1);
                    //Show error if we can't find a Tube station
                    if (filteredStops.length === 0) {
                        reject('No Underground station found. Please try a different station');
                        this.error = 'No Underground station found. Please try a different station';
                    } else {
                        resolve(filteredStops[0].id);
                    }
                });
            }
        });
    }

    export default {
        created() {

        },
        data() {
            return {
                stationQuery: null,
                station: null,
                stations: null,
                error: null,
                lines: null,
                loadingLines: false,
                line: null,
                direction: null
            }
        },
        methods: {
            searchStations() {
                //Query list of stations
                if (this.stationQuery.length < 4) return;
                client.get('StopPoint/Search', {
                    query: this.stationQuery,
                    modes: 'tube',
                }).then(response => {
                    this.stations = response.data.matches;
                });
            },
            selectStation(station) {
                this.station = station;
                extractNaptan(station)
                    .then((naptan) => {
                        Config.setStation(naptan);
                        //Get the Tube lines that run through this station
                        this.loadingLines = true;
                        console.log('Loading lines');
                        client.getNoCredentials('StopPoint/' + naptan, {})
                            .then(lineResponse => {
                                const tubeLines = lineResponse.data.lineModeGroups.filter(modeGroup => modeGroup.modeName === 'tube');
                                if (tubeLines.length === 0) {
                                    this.error = 'This station does not seem to be served by any Tube lines.';
                                    this.station = null;
                                    this.stations = null;
                                }
                                const lineIds = tubeLines[0].lineIdentifier;
                                //Search through the line array and filter by line ID
                                //This will give us display names rather than the ID string (even though they're basically the same)
                                this.lines = lineResponse.data.lines.filter(line => lineIds.indexOf(line.id) !== -1);
                            });
                    })
                    .catch((error) => {
                        this.error = error;
                        this.station = null;
                        this.stations = null;
                    })
                    .finally(() => {console.log('Not loading lines.'); this.loadingLines = false});
            },
            selectLine(line) {
                Config.setLine(line.id);
                this.line = line.name;
            },
            selectDirection() {
                Config.setDirection(this.direction);
                this.$parent.$emit('setupComplete');
            }
        }
    }
</script>