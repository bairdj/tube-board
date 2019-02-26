<template>
    <div class="displayLine">
        <div class="lineNumber">{{lineNumber}}</div>
        <div class="destination">{{destination}}</div>
        <div class="eta">{{etaDisplay}}</div>
    </div>
</template>

<style>
    .displayLine {
        clear: both;
    }

    .lineNumber {
        float: left;
        margin-right: 15px;
    }

    .destination {
        float: left;
    }

    .eta {
        float: right;
    }
</style>

<script>
    export default {
        props: [
            'lineNumber',
            'destination',
            'eta'
        ],
        computed: {
            etaDisplay() {
                const mins = Math.floor(this.eta / 60);
                if (mins === 0) {
                    return null;
                } else {
                    return mins + ' min';
                }
            }
        }
    }
</script>