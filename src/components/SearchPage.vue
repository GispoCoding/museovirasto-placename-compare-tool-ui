<template>
  <div class="search-page">
        <label for="findNameInput">Nimi:</label>
        <input id="findNameInput" v-model="nameInputValue" type="text">
        <button @click="findTopic">Hae</button>
        <div class="results">
            <div class="results-part">
                <h2>YSO-paikat</h2>
                <ul class="results-list" v-show="ysoResults.length > 0">
                    <li class="results-list-item" v-for="result in ysoResults" :key="result.localname + result.lang">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="result.uri" target="_blank"><b>{{ result.prefLabel }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ result.coordinateText }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ result.placeType }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Osa käsitettä:</div><div class="results-list-item-value"><a :href="result.broader.url" target="_blank">{{ result.broader.name }}</a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Huom:</div><div class="results-list-item-value">{{ result.note }}</div></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="vertical-divider"></div>
            <div class="results-part">
                <h2>Nimiarkisto</h2>
                <ul class="results-list" v-show="nimiarkistoResults.dataDetails.length > 0">
                    <li class="results-list-item" v-for="result in nimiarkistoResults.dataDetails" :key="result.id">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.id" target="_blank"><b>{{ result.labels.fi.value }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getNimiarkistoCoordinates(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ getNimiarkistoCollectedPlaceType(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Tekn info URL:</div><div class="results-list-item-value"><a :href="'https://nimiarkisto.fi/wiki/' + result.title" target="_blank">{{ result.title }}</a></div></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="vertical-divider"></div>
            <div class="results-part">
                <h2>MML</h2>
                <ul class="results-list" v-show="nlsResults.length > 0">
                    <li class="results-list-item" v-for="result in nlsResults" :key="'p' + result.paikkaid">
                        <ul class="results-list-item-list">
                            <li class="results-list-item-list-item"><div class="results-list-item-head"><b>Termi:</b></div><div class="results-list-item-value"><a :href="'http://paikkatiedot.fi/so/1000772/' + result.paikkaid" target="_blank"><b>{{ result.kirjoitusasu }}</b></a></div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Koordinaatit:</div><div class="results-list-item-value">{{ getNLSCoordinates(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Paikanlaji:</div><div class="results-list-item-value">{{ getNLSCollectedPlaceType(result) }}</div></li>
                            <li class="results-list-item-list-item"><div class="results-list-item-head">Kunta:</div><div class="results-list-item-value">{{ result.kunta }}</div></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
  </div>
</template>

<script>

const BASE_URL = "http://localhost:3000/"

export default {
    name: 'SearchPage',
    data () {
        return {
            nameInputValue: "Helsin",
            nimiarkistoResults: {
                dataDetails: [],
                labels: []
            },
            ysoResults: [],
            nlsResults: []
        }
    },
    methods: {
        findTopic (event) {

            this.nimiarkistoResults.dataDetails = [];
            this.nimiarkistoResults.dataDetails.labels = [];
            this.ysoResults = [];

            this.searchFromNimiarkisto(this.nameInputValue);
            this.searchFromFinto(this.nameInputValue);
            this.searchFromNLS(this.nameInputValue);
        },
        searchFromNLS(nameInputValue) {
            var _this = this;
            
            var requestConfig = {
                baseURL: BASE_URL,
                url: "/mml",
                method: "get",
                params: {
                    text: nameInputValue,
                }
            };

            this.axios.request(requestConfig).
                then(function (response) {
                    // console.log(response.data);
                    // for (var i = 0; i < response.data.length; i++) {
                    //     console.log(response.data[i].paikkaid);
                    // }
                    _this.nlsResults = response.data;
                });
        },
        searchFromNimiarkisto (nameInputValue) {
            
            var _this = this;
            
            var requestConfig = {
                baseURL: BASE_URL,
                url: "/nimiarkisto",
                method: "get",
                params: {
                    text: nameInputValue,
                }
            };

            this.axios.request(requestConfig).
                then(function (response) {
                    //console.log(response.data);
                    _this.nimiarkistoResults.labels = response.data.labels;

                    var dataDetails = [];

                    response.data.dataDetails.forEach(dataDetail => {
                       
                        if (dataDetail.claims.P10025 != undefined && dataDetail.claims.P10025[0].mainsnak.datavalue.value.id == "Q10") {
                            dataDetails.push(dataDetail);
                        }
                    });

                    _this.nimiarkistoResults.dataDetails = dataDetails;
                });
        },
        searchFromFinto (nameInputValue) {

            var _this = this;

            var requestConfig = {
                baseURL: "http://api.finto.fi/",
                url: "/rest/v1/yso-paikat/search",
                method: "get",
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    query: nameInputValue + "*",
                    lang: "fi",
                    unique: "true"
                }
            };

            this.axios.request(requestConfig).
                then(function (response) {
                    //console.log(response.data);

                    var results = response.data.results;

                    for (var i = 0; i < results.length; i++) {
                        results[i].coordinates = {
                            lat: null,
                            lon: null
                        }
                        results[i].coordinateText = "-";

                        results[i].broader = {
                            name: "",
                            url: ""   
                        };

                        results[i].note = "-";

                        results[i].placeType = "-";

                        results[i].prefLabels = {
                            fi: "",
                            en: "",
                            sv: ""
                        }
                    }

                    _this.ysoResults = results;

                    _this.ysoResults.forEach(element => {
                        _this.createYSODetails(element);
                    });

                }).catch(error => {
                    console.log(error);
                });

        },
        getInstanceOf (item) {
            var text = "";
            var id = item.claims.P31[0].mainsnak.datavalue.value.id;
            for (var i = 0; i < this.nimiarkistoResults.labels.length; i++) {
                var label = this.nimiarkistoResults.labels[i];
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
            var coordText = "";

            if (item.claims.P10012 != undefined) {
                var value = item.claims.P10012[0].mainsnak.datavalue.value;
                coordText = value.longitude + ", " + value.latitude;
            }

            return coordText;
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
        createYSODetails(item) {
            var _this = this;

            var requestConfig = {
                baseURL: "http://api.finto.fi/",
                url: "/rest/v1/yso-paikat/data",
                method: "get",
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    uri: item.uri
                }
            };

            this.axios.request(requestConfig).
                then(function (response) {

                    var closeMatch = null;
                    var broader = null;
                    var broaderURL = null;
                    var note = null;
                    var labels = {
                        fi: null,
                        sv: null,
                        en: null
                    }

                    for (var i = 0; i < response.data.graph.length; i++) {
                        if (response.data.graph[i].narrower != undefined &&
                            response.data.graph[i].narrower.uri == item.uri) {
                                //console.log("broader found");
                            for (var j = 0; j < response.data.graph[i].prefLabel.length; j++) {
                                if (response.data.graph[i].prefLabel[j].lang == "fi") {
                                    broader = response.data.graph[i].prefLabel[j].value;
                                    broaderURL = response.data.graph[i].uri;
                                    break;
                                }
                            }
                        }
                        if (response.data.graph[i].uri == item.uri) {
                            if (response.data.graph[i]["skos:closeMatch"] != undefined) {
                                // For getting coordinates below
                                closeMatch = response.data.graph[i]["skos:closeMatch"];
                            }
                            if (response.data.graph[i]["skos:note"] != undefined) {
                                //console.log(response.data.graph[i]["skos:note"]);
                                for (var j = 0; j < response.data.graph[i]["skos:note"].length; j++) {
                                    if (response.data.graph[i]["skos:note"][j].lang == "fi") {
                                        note = response.data.graph[i]["skos:note"][j].value;
                                        break;
                                    }
                                }
                            }
                            for (var j = 0; j < response.data.graph[i].prefLabel.length; j++) {
                                labels[response.data.graph[i].prefLabel[j].lang] = response.data.graph[i].prefLabel[j].value;
                            }
                        }
                    }

                    //
                    // Set broader, note and labels
                    //

                    for (var i = 0; i < _this.ysoResults.length; i++) {
                        if (item.uri == _this.ysoResults[i].uri) {
                            _this.ysoResults[i].broader.name = broader;
                            _this.ysoResults[i].broader.url = broaderURL;

                            if (note != null) {
                                _this.ysoResults[i].note = note;
                            }

                            _this.ysoResults[i].labels = labels;

                            break;
                        }
                    }

                    //
                    // Get coordinates
                    //

                    //console.log(closeMatch);

                    var paikkatiedotURI = null;
                    for (var i = 0; closeMatch.length; i++) {
                        if (closeMatch[i].uri.indexOf("paikkatiedot.fi") != -1) {
                            //console.log(closeMatch[i].uri);
                            if (closeMatch[i].uri.indexOf("paikkatiedot.fi/so/") != -1) {
                                paikkatiedotURI = closeMatch[i].uri;
                            }
                            break;
                        }
                    }

                    if (paikkatiedotURI != null) {
                        var requestConfig = {
                            baseURL: BASE_URL,
                            url: "/paikkatiedot",
                            method: "get",
                            params: {
                                paikkatiedotURI: paikkatiedotURI
                            }
                        };

                        _this.axios.request(requestConfig).
                            then(function (response) {
                                 //console.log(response.data);

                                 if (response.data != null) {
                                     var coordText = response.data.geo.longitude + ", " + response.data.geo.latitude;
                                     
                                     for (var i = 0; i < _this.ysoResults.length; i++) {
                                         if (item.uri == _this.ysoResults[i].uri) {

                                            _this.ysoResults[i].placeType = _this.getNLSPlaceType(response.data);

                                             _this.ysoResults[i].coordinates.lon = response.data.geo.longitude;
                                             _this.ysoResults[i].coordinates.lat = response.data.geo.latitude;
                                              _this.ysoResults[i].coordinateText = coordText;
                                             break;
                                         }
                                     }
                                 }
                        });
                    }

                }).catch(error => {
                    console.log(error);
                });
        },
        getNLSPlaceType(data) {
            var start = data.description.indexOf(':') + 2;
            var end = data.description.indexOf('in NLS Finland') - 1;
            var placeType = data.description.substring(start, end);

            var text = placeType;
            if (placeType == "Village, district or neighbourhood") {
                text = "kylä, kaupunginosa tai kulmakunta";
            }
            else if (placeType == "Island") {
                text = "saari";
            }
            else if (placeType == "Municipality, urban area") {
                text = "kunta, kaupunki";
            }
            else if (placeType == "Watercourse") {
                text = "virtavesi";
            }

            return text;
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
}

.vertical-divider {
    width: 1px;
    margin: 6px 6px;
    background: rgb(0, 0, 0);
}

.results-part {
    flex: 1 1 33%;
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

</style>
