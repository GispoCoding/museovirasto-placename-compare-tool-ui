<template>
  <div class="search-page">
        <div class="results">
            <div class="results-part">
                <h2>YSO-paikat</h2>
                <GridLoader class="loader" :loading="placeNames.loadingYSOData" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <ul class="results-list" v-if="placeNames.ysoResults.length > 0">
                    <li class="results-list-item" v-for="result in placeNames.ysoResults" :key="result.localname + result.lang">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="result.uri" target="_blank"><b>{{ result.prefLabel }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">MML-koordinaatit:</div><div class="results-list-item-value">{{ result.coordinateText }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">MML-paikanlaji:</div><div class="results-list-item-value">{{ result.placeType }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Osa käsitettä:</div><div class="results-list-item-value">
                                    <a v-if="result.broader.name != '-'" :href="result.broader.url" target="_blank">{{ result.broader.name }}</a>
                                    <span v-else>{{ result.broader.name }}</span>
                                </div>
                            </li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Huom:</div><div class="results-list-item-value">{{ result.note }}</div></li>
                        </ul>
                    </li>
                </ul>
                <div v-else-if="!placeNames.loadingYSOData">
                    -
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="results-part">
                <h2>Nimiarkisto</h2>
                <GridLoader class="loader" :loading="placeNames.loadingNimiarkistoData" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <ul class="results-list" v-if="placeNames.nimiarkistoResults.dataDetails.length > 0">
                    <li class="results-list-item" v-for="result in placeNames.nimiarkistoResults.dataDetails" :key="result.id">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.id" target="_blank"><b>{{ result.labels.fi.value }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getNimiarkistoCoordinates(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ getNimiarkistoCollectedPlaceType(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Tekn info URL:</div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.title" target="_blank">{{ result.title }}</a></div></li>
                        </ul>
                    </li>
                </ul>
                <div v-else-if="!placeNames.loadingNimiarkistoData">
                    -
                </div>
                <div v-if="placeNames.nimiarkistoResults.dataDetails.length > 500">
                    <p>Tuloksia näytettiin {{ placeNames.nimiarkistoResults.dataDetails.length }}, mutta niitä voi olla enemmän.</p>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="results-part">
                <h2>MML</h2>
                <GridLoader class="loader" :loading="placeNames.loadingNLSData" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <ul class="results-list" v-if="placeNames.nlsResults.length > 0">
                    <li class="results-list-item" v-for="result in placeNames.nlsResults" :key="'p' + result.paikkaid">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'http://paikkatiedot.fi/so/1000772/' + result.paikkaid" target="_blank"><b>{{ result.kirjoitusasu }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getNLSCoordinates(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ getNLSCollectedPlaceType(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Kunta:</div><div class="results-list-item-value">{{ result.kunta }}</div></li>
                        </ul>
                    </li>
                </ul>
                <div v-else-if="!placeNames.loadingNLSData">
                    -
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="results-part">
                <h2>Wikidata</h2>
                <GridLoader class="loader" :loading="placeNames.loadingWikidata" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <ul class="results-list" v-if="placeNames.wikidataResults.dataDetails.length > 0">
                    <li class="results-list-item" v-for="result in placeNames.wikidataResults.dataDetails" :key="result.id">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'https://www.wikidata.org/wiki/' + result.id" target="_blank"><b>{{ getWikidataTitle(result) }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getWikidataCoordinates(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Tyyppi:</div><div class="results-list-item-value">{{ getWikidataInstanceOf(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Kuvaus:</div><div class="results-list-item-value">{{ getWikidataDescription(result) }}</div></li>
                        </ul>
                    </li>
                </ul>
                <div v-if="placeNames.wikidataResults.dataDetails.length > 500">
                    <p>Tuloksia näytettiin {{ placeNames.wikidataResults.dataDetails.length }}, mutta niitä voi olla enemmän.</p>
                </div>
            </div>
        </div>
        <div class="footer">
            <p>Hyödyntää:</p>
            <ul class="attribution">
                <li class="attribution-item">Maanmittauslaitoksen paikannimi-aineistoa, Maanmittauslaitos, 08/2018, <a href="https://www.maanmittauslaitos.fi/avoindata-lisenssi-cc40" target="_blank">CC-BY-4.0</a></li>
                <li class="attribution-item">Finton <a href="http://finto.fi/yso-paikat/fi/" target="_blank">YSO-paikkojen</a> aineistoja</li>
                <li class="attribution-item">Kotimaisten kielten keskuksen <a href="https://nimiarkisto.fi/" target="_blank">nimiarkisto.fi</a>-aineistoja, <a href="https://creativecommons.org/licenses/by/4.0/legalcode.fi" target="_blank">CC-BY-4.0</a>, <a href="https://nimiarkisto.fi/wiki/Nimiarkisto:Tietosuojak%C3%A4yt%C3%A4nt%C3%B6" target="_blank">lisätietoja Nimiarkiston lisensoinnista</a></li>
                <li class="attribution-item"><a href="https://www.wikidata.org/" target="_blank">Wikidata</a>-aineistoja, CC0 / <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC BY-SA 3.0</a>, <a href="https://www.wikidata.org/wiki/Wikidata:Licensing" target="_blank">lisätietoja Wikidatan lisensoinnista</a></li>
                <li class="attribution-item"><a href="https://mapicons.mapsmarker.com/" target="_blank"><img class="size-full wp-image-1381 alignnone" title="miclogo-88x31" src="/static/images/mapiconscollection-markers/miclogo-88x31.gif" alt="" width="88" height="31"></a></li>
            </ul>
        </div>
  </div>
</template>

<script>

import GridLoader from 'vue-spinner/src/GridLoader.vue'

export default {
    name: 'SearchPage',
    components: {
        GridLoader
    },
    data () {
        return {
            vueSpinnerSize: '16px',
            vueSpinnerColor: '#800b8f',
        }
    },
    computed: {
        placeNames () {
            return this.$store.state.placeNames;
        }
    },
    methods: {
        getNimiarkistoInstanceOf (item) {
            var text = "";
            var id = item.claims.P31[0].mainsnak.datavalue.value.id;
            for (var i = 0; i < this.placeNames.nimiarkistoResults.labels.length; i++) {
                var label = this.placeNames.nimiarkistoResults.labels[i];
                if (id == label.id) {
                    text = label.labels.fi.value;
                    break;
                }
            }
            return text;
        },
        getNimiarkistoCollectedPlaceType(item) {
            var text = "";

            if (item.claims.P10016 != undefined) {
                text = item.claims.P10016[0].mainsnak.datavalue.value;
            }

            return text;
        },
        getNimiarkistoCoordinates (item) {
            var coordText = "-";

            if (item.claims.P10012 != undefined) {
                var value = item.claims.P10012[0].mainsnak.datavalue.value;
                coordText = value.longitude + ", " + value.latitude;
            }

            return coordText;
        },
        getWikidataTitle (item) {
            var text = "";

            if (item.labels.fi != undefined) {
                text = item.labels.fi.value + " (" + item.id + ")";
            }
            else if (item.labels.en != undefined) {
                text = item.labels.en.value + " (" + item.id + ")";
            }
            else {
                text = item.id;
            }

            return text;
        },
        getWikidataInstanceOf (item) {
            // console.log(item);
            var text = "";
            // console.log(item.claims.P31);
            for (var j = 0; j < item.claims.P31.length; j++) {
                var id = item.claims.P31[j].mainsnak.datavalue.value.id;
                for (var i = 0; i < this.placeNames.wikidataResults.labels.length; i++) {
                    var label = this.placeNames.wikidataResults.labels[i];
                    if (id == label.id) {
                        //console.log(label);
                        if (label.labels.fi != undefined) {
                            text += label.labels.fi.value;
                        }
                        else if (label.labels.en != undefined) {
                            text += label.labels.en.value;
                        }
                        else {
                            text += label.id;
                        }
                        text += ", ";
                        break;
                    }
                }
            }
            text = text.slice(0, -1);
            text = text.slice(0, -1);
            return text;
        },
        getWikidataCoordinates (item) {
            var coordText = "-";

            if (item.claims.P625 != undefined) {
                // console.log(item.claims.P625[0].mainsnak);
                var value = item.claims.P625[0].mainsnak.datavalue.value;
                coordText = value.longitude + ", " + value.latitude;
            }

            return coordText;
        },
        getWikidataDescription (item) {
            var text = "";
            //console.log(item);
            if (item.descriptions.fi != undefined) {
                text = item.descriptions.fi.value;
            }
            else if (item.descriptions.en != undefined) {
                text = item.descriptions.en.value;
            }
            else {
                text = "-";
            }

            return text;
        },
        getNLSCoordinates (item) {
            var coordText = "";
            coordText = item.geom.coordinates[0] + ", " + item.geom.coordinates[1];
            return coordText;
        },
        getNLSCollectedPlaceType(item) {
            var text = "";
            text = item.paikkatyyppi.toLowerCase() + "; " + item.paikkatyyppiryhma.toLowerCase();
            return text;
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.results {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    margin: 5px;
}

.loader {
    margin: auto;    
}


.results-list {
    list-style: none;
    margin: auto;
    text-align: left;
    padding: 0px;
}

.results-list-item-list {
    list-style: none;
    margin: auto;
    text-align: left;
     padding: 0px;
}

.results-list-item {
    padding-bottom: 20px;
}

.results-list-item-list-item {
    padding-bottom: 2px;
    display: flex;
}

.results-list-item-head {
    flex: 0 0 34%;
}

.results-list-item-value {
    flex: 0 0 66%;
    align-self: flex-end;
}

.vertical-divider {
    width: 1px;
    margin: 6px 6px;
    background: rgb(0, 0, 0);
}

.results-part {
    flex: 1 1 25%;
    display: flex;
    align-self: flex-start;
    flex-direction: column;
    padding: 0px;
}

.results-table {
    margin: auto;
    border-collapse: separate; 
    border-spacing: 0 1em;
}

.footer {
    position: fixed;
    font-family: 'Barlow Condensed', sans-serif;
    bottom: 0;
    width: 100%;
    /* height:60px; */
    border-top: #000 1px solid;
    background:#fff;
}

.attribution {
    list-style: none;
}

.attribution-item {
    padding-bottom: 2px;
}

</style>
