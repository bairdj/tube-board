<template>
    <div v-if="configured">
        <Board />
        <button @click="reset">Reset settings</button>
    </div>
    <Setup v-else/>
</template>

<style>
    button {
        display: block;
        margin: 10px auto 0;
    }
</style>

<script>
    import Setup from './Setup.vue';
    import Board from './Board.vue';
    import Train from "../Train";

    import Config from '../Config';

    const naptanId = '940GZZLUFYC';
    const direction = 'inbound';
    const line = 'northern';

    export default {
        components: {
            Board,
            Setup
        },
        data() {
            return {
                configured: Config.isConfigured()
            }
        },
        created() {
            //Bind setup complete listener
            this.$on('setupComplete', () => this.configured = Config.isConfigured());
        },
        methods: {
            reset() {
                Config.reset()
                this.configured = false;
            }
        }
    }
</script>