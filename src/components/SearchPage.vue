<template>
  <div class="search-page">
        <label for="findNameInput">Nimi:</label>
        <input id="findNameInput" v-model="nameInputValue" type="text">
        <button @click="findTopic">Hae</button>
        <div class="results">
            <div class="yso-paikat-results">
                <h2>YSO</h2>
                <table class="results-table" v-show="ysoResults.length > 0">
                    <tr>
                        <th>Termi</th>
                        <th>MML-koordinaatit</th>
                        <th>MML-paikanlaji</th>
                        <th>Osa käsitettä</th>
                        <th>Huom.</th>
                    </tr>
                    <tr v-for="result in ysoResults" :key="result.localname + result.lang">
                        <td><a :href="result.uri" target="_blank">{{ result.prefLabel }}</a></td>
                        <td>{{ result.coordinateText }}</td>
                        <td>{{ result.placeType }}</td>
                        <td><a :href="result.broader.url" target="_blank">{{ result.broader.name }}</a></td>
                        <td>{{ result.note }}</td>
                    </tr>
                </table>
            </div>
            <div class="vertical-divider"></div>
            <div class="nimiarkisto-results">
                <h2>Nimiarkisto</h2>
                <table class="results-table" v-show="nimiarkistoResults.dataDetails.length > 0">
                    <tr>
                        <th>Termi</th>
                        <th>Koordinaatit</th>
                        <th>Paikanlaji</th>
                        <th>Tekn info URL</th>
                    </tr>
                    <tr v-for="result in nimiarkistoResults.dataDetails" :key="result.id">
                        <td><a :href="'https://nimiarkisto.fi/wiki/' + result.id" target="_blank">{{ result.labels.fi.value }}</a></td>
                        <td>{{ getNimiarkistoCoordinates(result) }}</td>
                        <td>{{ getCollectedPlaceType(result) }}</td>
                        <td><a :href="'https://nimiarkisto.fi/wiki/' + result.title" target="_blank">{{ result.title }}</a></td>
                    </tr>
                </table>
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
        }
    },
    methods: {
        findTopic (event) {

            this.nimiarkistoResults.dataDetails = [];
            this.nimiarkistoResults.dataDetails.labels = [];
            this.ysoResults = [];

            this.searchFromNimiarkisto(this.nameInputValue);
            this.searchFromFinto(this.nameInputValue);
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
                    lang: "fi"
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
                        results[i].coordinateText = "";

                        results[i].broader = {
                            name: "",
                            url: ""   
                        };

                        results[i].note = "";

                        results[i].placeType = "";

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
        getCollectedPlaceType(item) {
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

                            _this.ysoResults[i].note = note;

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

.results-table {
    margin: auto;
    border-collapse: separate; 
    border-spacing: 0 1em;
}

.yso-paikat-results {
    flex: 1 1 50%;
    display: flex;
    align-self: flex-start;
    flex-direction: column;
}

.vertical-divider {
    width: 1px;
    margin: 6px 6px;
    background: rgb(0, 0, 0);
}

.nimiarkisto-results {
    flex: 1 1 50%;
    display: flex;
    align-self: flex-start;
    flex-direction: column;
}


</style>
