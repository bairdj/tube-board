<template>
  <div id="setup">
    <h3>Setup Tube Board</h3>
    <form>
      <div class="group">
        <label>1. Select station</label>
        <VSelect @search="searchStations" @input="selectStation" :options="stations" label="name"/>
      </div>
      <div v-if="station" class="group">
        <label>2. Select line</label>
        <p v-if="loadingLines">
          Loading Tube lines...
        </p>
        <VSelect v-if="lines" :options="lines" label="name" @input="selectLine"/>
      </div>
      <div v-if="station && line" class="group">
        <label>3. Select direction</label>
        <VSelect :options="directions"
                 @input="selectDirection"
                 :reduce="direction => direction.value"
        />
      </div>
    </form>
    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>
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

  .group {
    margin-bottom: 5px;
  }
</style>

<script>
import VSelect from 'vue-select';
import client, { TflClient } from '../TflClient';
import Config from '../Config';

import 'vue-select/dist/vue-select.css';

function extractNaptan(station) {
  return new Promise((resolve, reject) => {
    /* We need a NAPTAN ID to query the arrivals. This should be in topMostParentId.
    If this is missing, the station is a "HUB".
    Therefore we need to query the actual Tube stops associated with it. */
    if ('topMostParentId' in station) {
      // Crack on
      resolve(station.topMostParentId);
    } else {
      // This endpoint refuses to take credentials, so just a blank Axios request
      TflClient.getNoCredentials(`StopPoint/${station.id}`, {
        includeCrowdingData: false,
      }).then((response) => {
        // Under `children` will be StopPoints
        // We need to find the one that has Tube mode
        const filteredStops = response.data.children.filter(stopPoint => stopPoint.modes.indexOf('tube') !== -1);
        // Show error if we can't find a Tube station
        if (filteredStops.length === 0) {
          reject(new Error('No Underground station found. Please try a different station'));
          this.error = 'No Underground station found. Please try a different station';
        } else {
          resolve(filteredStops[0].id);
        }
      });
    }
  });
}

const directions = [{
  label: 'Inbound',
  value: 'inbound',
},
{
  label: 'Outbound',
  value: 'outbound',
},
];

export default {
  components: {
    VSelect,
  },
  data() {
    return {
      stationQuery: null,
      station: null,
      stations: [],
      error: null,
      lines: null,
      loadingLines: false,
      line: null,
      direction: null,
      directions,
    };
  },
  created() {

  },
  methods: {
    searchStations(term, loading) {
      // Query list of stations
      if (term.length < 4) return;
      loading(true);
      client.get('StopPoint/Search', {
        query: term,
        modes: 'tube',
      }).then((response) => {
        loading(false);
        this.stations = response.data.matches;
      });
    },
    selectStation(station) {
      this.station = station;
      if (station == null) {
        this.lines = null;
        return;
      }
      extractNaptan(station)
        .then((naptan) => {
          Config.setStation(naptan);
          // Get the Tube lines that run through this station
          this.loadingLines = true;
          TflClient.getNoCredentials(`StopPoint/${naptan}`, {})
            .then((lineResponse) => {
              const tubeLines = lineResponse.data.lineModeGroups.filter(modeGroup => modeGroup.modeName === 'tube');
              if (tubeLines.length === 0) {
                this.error = 'This station does not seem to be served by any Tube lines.';
                this.station = null;
                this.stations = null;
              }
              const lineIds = tubeLines[0].lineIdentifier;
              /* Search through the line array and filter by line ID.
               This will give us display names rather than the ID string,
               even though they're basically the same */
              this.lines = lineResponse.data.lines.filter(line => lineIds.indexOf(line.id) !== -1);
            });
        })
        .catch((error) => {
          this.error = error;
          this.station = null;
          this.stations = null;
        })
        .finally(() => {
          this.loadingLines = false;
        });
    },
    selectLine(line) {
      Config.setLine(line.id);
      this.line = line.name;
    },
    selectDirection(direction) {
      Config.setDirection(direction);
      this.$parent.$emit('setupComplete');
    },
  },
};
</script>
