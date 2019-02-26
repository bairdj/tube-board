<template>
  <div id="board">
    <MessageDisplay v-if="trains.length === 0">
      No trains arriving :(
    </MessageDisplay>
    <TrainDisplay
      v-if="trains.length > 0"
      line-number="1"
      :destination="trains[0].destination"
      :eta="trains[0].eta"
    />
    <transition name="slide-up">
      <TrainDisplay
        v-if="lineTwoTrain && !showLineThree"
        key="lineTwo"
        :line-number="lineTwoIndex + 1"
        :destination="lineTwoTrain.destination"
        :eta="lineTwoTrain.eta"
      />
      <TrainDisplay
        v-if="lineTwoTrain && showLineThree"
        key="lineThree"
        :line-number="lineTwoIndex + 1"
        :destination="lineTwoTrain.destination"
        :eta="lineTwoTrain.eta"
      />
    </transition>
  </div>
</template>

<style>

  #board {
    background-color: black;
    color: darkorange;
    height: 100px;
    width: 800px;
    font-size: 40px;
    line-height: 50px;
    font-family: sans-serif;
    overflow-y: hidden;
    border-radius: 3px;
    margin: 0 auto;
  }


  .displayLine {
    margin: 0 10px;
  }

  .slide-up-enter {
    transform: translateY(50px);
  }

  .slide-up-enter-active {
    transition: all 0.5s linear;
  }
</style>

<script>
import TrainDisplay from './TrainDisplay.vue';
import MessageDisplay from './MessageDisplay.vue';
import Train from '../Train';
import client from '../TflClient';
import Config from '../Config';

// How often to cycle the screen
const cycleInterval = 10000;
// How often to refresh the arrivals from the API
const refreshInterval = 45000;

export default {
  components: {
    TrainDisplay,
    MessageDisplay,
  },
  data() {
    return {
      lineTwoTrain: undefined,
      lineTwoIndex: 0,
      showLineThree: true,
      trains: [],
    };
  },
  watch: {
    trains() {
      this.resetDisplay();
      this.cycleDisplay();
    },
  },
  mounted() {
    this.getTrains();
    setInterval(this.cycleDisplay, cycleInterval);
    setInterval(this.getTrains, refreshInterval);
  },
  methods: {
    resetDisplay() {
      this.lineTwoIndex = 0;
      this.lineTwoTrain = undefined;
    },
    cycleDisplay() {
      const originalIndex = this.lineTwoIndex;
      let newIndex = this.lineTwoIndex + 1;
      if (newIndex === this.trains.length) {
        // Reset to second element
        newIndex = 1;
      }
      // Cycle the display if the index is different
      if (originalIndex !== newIndex) {
        this.showLineThree = !this.showLineThree;
      }
      this.lineTwoIndex = newIndex;
      this.lineTwoTrain = this.trains[this.lineTwoIndex];
    },
    getTrains() {
      client.get(`Line/${Config.getLine()}/Arrivals/${Config.getStation()}`, {
        direction: Config.getDirection(),
      }).then((response) => {
        // Process into train object
        const trainList = [];
        response.data.forEach((responseTrain) => {
          trainList.push(new Train(responseTrain.towards, responseTrain.timeToStation));
        });
        // Sort them into arrival order
        trainList.sort((a, b) => a.eta - b.eta);
        this.trains = trainList;
      }).catch(rejected => console.log(rejected));
    },
  },
};
</script>
