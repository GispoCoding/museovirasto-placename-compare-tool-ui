<template>
    <div class="admin-page">
        <h2>Nimistön hallinta</h2>
        <ResultModal v-if="showModal" @close="showModal = false" :result="resultTTL">
        </ResultModal>
        <div class="results">
            <div class="admin-part">
                <GridLoader class="loader" :loading="placeNames.loadingNimiarkistoData" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <div v-show="placeNames.nimiarkistoResults.dataDetails.length > 0" class="admin-all-actions"><a href="#" @click.prevent="createTTLVolcabularyOfAllNimiarkistoItems()">Tee kaikista keruumerkinnöistä YSO-paikat-sanasto</a></div>
                <GridLoader class="loader" :loading="creatingVolcabulary" :color="vueSpinnerColor" :size="vueSpinnerSize"></GridLoader>
                <table class="results-table" v-show="placeNames.nimiarkistoResults.dataDetails.length > 0">
                    <tr>
                        <th>Nimiarkiston keruumerkintä</th>
                        <th>Ylläpitotoimi</th>
                    </tr>
                    <tr v-for="result in placeNames.nimiarkistoResults.dataDetails" :key="result.id">
                        <td>
                            <ul class="results-list-item-list">
                                <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.id" target="_blank"><b>{{ result.labels.fi.value }}</b></a></div></li>
                                <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getNimiarkistoCoordinates(result) }}</div></li>
                                <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ getNimiarkistoCollectedPlaceType(result) }}</div></li>
                                <li class="results-list-item-list-item"><div class="results-list-item-head">Tekn info URL:</div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.title" target="_blank">{{ result.title }}</a></div></li>
                            </ul>
                        </td>
                        <td>
                            <ul class="results-list-item-list">
                                <li><a href="#" @click.prevent="createTTLOfTheNimiarkistoItem(result)">Tee merkinnästä YSO-paikat-käsite</a></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>

import GridLoader from 'vue-spinner/src/GridLoader.vue'
import axios from 'axios'

import ResultModal from '@/components/ResultModal'

const BASE_URL = "http://localhost:3000/";

export default {
    name: 'AdminPage',
    components: {
        GridLoader,
        ResultModal
    },
    data () {
        return {
            vueSpinnerSize: '16px',
            vueSpinnerColor: '#800b8f',
            creatingVolcabulary: false,
            schemeNameYSOPlaces: 'ysopaikat',
            schemeNameNimi: 'nimi',
            conceptsIndex: 1,
            showModal: false,
            resultTTL: '',
        }
    },
    computed: {
        placeNames () {
            //console.log(this.$store.state.placeNames);
            return this.$store.state.placeNames;
        }
    },
    methods: {
        getInstanceOf (item) {
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
        getNimiarkistoCoordinates(item) {
            var coordText = "-";

            if (item.claims.P10012 != undefined) {
                var value = item.claims.P10012[0].mainsnak.datavalue.value;
                coordText = value.longitude + ", " + value.latitude;
            }

            return coordText;
        },
        getNimiarkistoValueForClaim(item, claim) {
            return new Promise((resolve, reject) => {
                var value = null;
                if (item.claims[claim] != undefined) {
                    if (item.claims[claim][0].mainsnak.datatype == "wikibase-item") {
                        this.getNimiarkistoItemInfo(item.claims[claim][0].mainsnak.datavalue.value.id).then((data) => {
                            //console.log(data);
                            resolve(data[0].labels.fi.value);
                        });
                    }
                    else if (item.claims[claim][0].mainsnak.datatype == "globe-coordinate") {
                        value = item.claims[claim][0].mainsnak.datavalue.value;
                        resolve(value);
                    }
                    else if (item.claims[claim][0].mainsnak.datatype == "string") {
                        value = item.claims[claim][0].mainsnak.datavalue.value;
                        resolve(value);
                    }
                     else if (item.claims[claim][0].mainsnak.datatype == "time") {
                        value = item.claims[claim][0].mainsnak.datavalue.value.time.split('-')[0].split('+')[1];
                        resolve(value);
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    resolve(null);
                }
            });
        },
        async createTTLVolcabularyOfAllNimiarkistoItems() {
            var concepts = [];
            var collections = [];

            this.creatingVolcabulary = true;

            var items = this.placeNames.nimiarkistoResults.dataDetails;
            for (var i = 0; i < items.length; i++) {
                var conceptData = await this.createConceptData(items[i]);
                concepts.push(conceptData.conceptTriples);
                var found = false;
                for (var j = 0; j < collections.length; j++) {
                    if (collections[j].name == conceptData.collectionPrefLabel) {
                        collections[j].members.push(conceptData.id);
                        found = true;
                        break;
                    }
                }
                if (!found && conceptData.collectionPrefLabel != null) {
                    var collection = {
                        name: conceptData.collectionPrefLabel,
                        members: [conceptData.id]
                    }
                    collections.push(collection);
                }
            }

            this.creatingVolcabulary = false;

            this.showVolcabularyResult(concepts, collections);
        },
        showVolcabularyResult(concepts, collections) {
            this.resultTTL = "";
            var ws = '    ';

            this.resultTTL += '@prefix dc: <http://purl.org/dc/elements/1.1/> .\n';
            this.resultTTL += '@prefix dct: <http://purl.org/dc/terms/> .\n';
            this.resultTTL += '@prefix isothes: <http://purl.org/iso25964/skos-thes#> .\n';
            this.resultTTL += '@prefix owl: <http://www.w3.org/2002/07/owl#> .\n';
            this.resultTTL += '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n';
            this.resultTTL += '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n';
            this.resultTTL += '@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n';
            this.resultTTL += '@prefix xml: <http://www.w3.org/XML/1998/namespace> .\n';
            this.resultTTL += '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n';
            this.resultTTL += '@prefix wd: <http://www.wikidata.org/entity/> .\n';
            this.resultTTL += '@prefix ysa: <http://www.yso.fi/onto/ysa/> .\n';
            this.resultTTL += '@prefix allars: <http://www.yso.fi/onto/allars/> .\n';
            this.resultTTL += '@prefix geo: <http://www.opengis.net/ont/geosparql#> .\n';
            this.resultTTL += '@prefix skosext: <http://www.ldf.fi/schema/skosext/#> .\n';
            this.resultTTL += '@prefix ' + this.schemeNameNimi + ': <https://nimiarkisto.fi/wiki/> .\n';
            this.resultTTL += '@prefix ' + this.schemeNameYSOPlaces + ': <http://www.yso.fi/onto/yso/places> .\n';

            this.resultTTL += '\n';
            this.resultTTL += '\n';

            this.resultTTL += this.schemeNameYSOPlaces + ': a skos:ConceptScheme ;\n';
            this.resultTTL += ws + 'skos:prefLabel "Nimiarkisto.fi by Kotus"@en ,\n';
            this.resultTTL += ws + ws + '"Nimiarkisto.fi, Kotus"@fi ;\n';
            this.resultTTL += ws + 'dct:title "Nimiarkisto.fi by Kotus"@en ,\n';
            this.resultTTL += ws + ws + '"Nimiarkisto.fi, Kotus"@fi ;\n';
            this.resultTTL += ws + 'dct:source <https://nimiarkisto.fi/wiki/> .\n';

            this.resultTTL += '\n';
            this.resultTTL += '\n';

            for (var i = 0; i < concepts.length; i++) {
                var conceptTriples = concepts[i];
                for (var j = 0; j < conceptTriples.length; j++) {
                    this.resultTTL += conceptTriples[j] + "\n";
                }
                this.resultTTL += '\n';
            }

            this.resultTTL += '\n';

            for (var i = 0; i < collections.length; i++) {
                this.resultTTL += this.createCollectionTTL(collections[i]);
                this.resultTTL += '\n';
            }

            this.showModal = true;
        },
        createCollectionTTL(collection) {
            var TTL = '';
            var ws = '    ';

            TTL += this.schemeNameYSOPlaces + ':p' + this.conceptsIndex++ + ' a skos:Collection ;\n';
            TTL += ws + 'skos:prefLabel "' + collection.name + '"@fi ;\n';
            TTL += ws + 'skos:member ';
            for (var i = 0; i < collection.members.length; i++) {
                TTL += collection.members[i] + ', ';
            }
            TTL = TTL.substring(0, TTL.length - 2) + ' .\n';

            return TTL;
        },
        async createTTLOfTheNimiarkistoItem(item) {
            var conceptData = await this.createConceptData(item);

            this.showResult(conceptData);
        },
        async createConceptData(item) {
            var conceptTriples = [];

            var P10015 = await this.getNimiarkistoValueForClaim(item, 'P10015');
            //console.log('P10015: ' + P10015);
            var P10013 = await this.getNimiarkistoValueForClaim(item, 'P10013');
            //console.log('P10013: ' + P10013);
            var P10053 = await this.getNimiarkistoValueForClaim(item, 'P10053');
            //console.log('P10053: ' + P10053);
            var P10009 = await this.getNimiarkistoValueForClaim(item, 'P10009');
            //console.log('P10009: ' + P10009);
            var P10017 = await this.getNimiarkistoValueForClaim(item, 'P10017');
            //console.log('P10017: ' + P10017);
            var P10012 = await this.getNimiarkistoValueForClaim(item, 'P10012');
            //console.log('P10012: ' + P10012);

            conceptTriples.push(this.schemeNameYSOPlaces + ':p' + this.conceptsIndex + ' a skos:Concept ;');
            //console.log(concepts);
            var ws = '    ';
            if (P10015 != null && P10013 != null) {
                conceptTriples.push(ws + 'skos:prefLabel "' + P10015 + ' (' + P10013 + ')"@fi ;');
            }
            //console.log(concepts);
            conceptTriples.push(ws + 'rdfs:comment "' + item.descriptions.fi.value + '"@fi ;');
            if (P10053 != null) {
                conceptTriples.push(ws + 'dct:identifier ' + P10053 + ' ;');
            }
            //console.log(concepts);
            if (P10009 != null) {
                conceptTriples.push(ws + 'dct:date ' + P10009 + ' ;');
            }
            //console.log(concepts);
            if (P10017 != null) {
                conceptTriples.push(ws + 'dct:creator "' + P10017 + '"@fi ;');
            }
            //console.log(concepts);
            if (P10012 != null) {
                conceptTriples.push(ws + 'geo:hasGeometry [ geo:asWKT "<http://www.opengis.net/def/crs/EPSG/0/4326>Point(' + P10012.latitude + ' ' + P10012.longitude + ')"^^geo:WKTLiteral ] ;');
            }
            //console.log(concepts);
            conceptTriples.push(ws + 'skos:exactMatch ' + this.schemeNameNimi + ':' + item.id + ' .');
    
            //console.log(conceptTriples);

            var P10016 = await this.getNimiarkistoValueForClaim(item, 'P10016');
            //console.log('P10016: ' + P10016);

            return {
                id: this.schemeNameYSOPlaces + ':p' + this.conceptsIndex++,
                collectionPrefLabel: P10016,
                conceptTriples: conceptTriples
            }
        },
        showResult(conceptData) {
            this.resultTTL = "";
            for (var i = 0; i < conceptData.conceptTriples.length; i++) {
                this.resultTTL += conceptData.conceptTriples[i] + "\n";
            }
            this.showModal = true;
        },
        getNimiarkistoItemInfo(id) {

            return new Promise((resolve, reject) => {
                var requestConfig = {
                    baseURL: BASE_URL,
                    url: "/nimiarkisto/item",
                    method: "get",
                    params: {
                        itemID: id,
                    }
                };

                axios.request(requestConfig).
                    then(function (response) {
                        
                        resolve(response.data);
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                    });
            });
        }

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

.admin-all-actions {
    margin: auto;
    flex: 1 1 100%;
    margin-bottom: 10px;
}

.results-table {
    margin: auto;
    flex: 1 1 100%;

    /* border-collapse: separate;
    border-width: 1px;
    border-color: #000;
    border-spacing: 0 1em; */
}

.results-table > tr > td {
    border: 1px solid black;
    padding: 10px;
}

.results-table > tr > th {
    border: 1px solid black;
    padding: 10px;
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

.admin-part {
    flex: 1 1 100%;
    display: flex;
    align-self: flex-start;
    flex-direction: column;
    padding: 0px;
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
