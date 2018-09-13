
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(Vuex)
Vue.use(VueAxios, axios)

const BASE_URL = "http://localhost:3000/"

const placeNames = {
    nimiarkistoResults: {
        dataDetails: [],
        labels: []
    },
    ysoResults: [],
    nlsResults: [],
    loadingYSOData: false,
    loadingNimiarkistoData: false,
    loadingNLSData: false,
}

export default new Vuex.Store({
    state: {
        placeNames: placeNames,
    },
    mutations: {
        resetPlaceNames(state) {
            state.placeNames.nimiarkistoResults.dataDetails = [];
            state.placeNames.nimiarkistoResults.labels = [];
            state.placeNames.ysoResults = [];
        },
        setLoadingYSOData(state, value) {
            state.placeNames.loadingYSOData = value;
        },
        setYSOResults(state, results) {
            state.placeNames.ysoResults = results;
        },
        setYSOResultDetails(state, params) {
            if (params.data != null) {
                for (var i = 0; i < state.placeNames.ysoResults.length; i++) {
                    if (params.item.uri == state.placeNames.ysoResults[i].uri) {
                        if (params.data.broader != null) {
                            state.placeNames.ysoResults[i].broader.name = params.data.broader;
                        }
                        else {
                            state.placeNames.ysoResults[i].broader.name = "-";
                        }
                        if (params.data.broaderURL != null) {
                            state.placeNames.ysoResults[i].broader.url = params.data.broaderURL;
                        }

                        if (params.data.note != null) {
                            state.placeNames.ysoResults[i].note = params.data.note;
                        }
                        else {
                            state.placeNames.ysoResults[i].note = "-";
                        }

                        state.placeNames.ysoResults[i].labels = params.data.labels;

                        break;
                    }
                }
            }
        },
        setYSOResultCoordinates(state, params) {
            if (params.data != null) {
                for (var i = 0; i < state.placeNames.ysoResults.length; i++) {
                    if (params.item.uri == state.placeNames.ysoResults[i].uri) {

                        var coordText = "-";
                        if (params.data != null) {
                            coordText = params.data.geo.longitude + ", " + params.data.geo.latitude;
                        

                            state.placeNames.ysoResults[i].placeType = getNLSPlaceType(params.data);

                            state.placeNames.ysoResults[i].coordinates.lon = params.data.geo.longitude;
                            state.placeNames.ysoResults[i].coordinates.lat = params.data.geo.latitude;
                        }

                        state.placeNames.ysoResults[i].coordinateText = coordText;
                        break;
                    }
                }
            }
            else {
                for (var i = 0; i < state.placeNames.ysoResults.length; i++) {
                    if (params.item.uri == state.placeNames.ysoResults[i].uri) {
                        var coordText = "-";
                        state.placeNames.ysoResults[i].coordinateText = coordText;
                        state.placeNames.ysoResults[i].placeType = "-";
                        break;
                    }
                }
            }
        },
        setLoadingNimiarkistoData(state, value) {
            state.placeNames.loadingNimiarkistoData = value;
        },
        setNimiarkistoResultLabels(state, labels) {
            state.placeNames.nimiarkistoResults.labels = labels;
        },
        setNimiarkistoResultDataDetails(state, dataDetails) {
            state.placeNames.nimiarkistoResults.dataDetails = dataDetails;
        },
        setLoadingNLSData(state, value) {
            state.placeNames.loadingNLSData = value;
        },
        setNLSResults(state, results) {
            state.placeNames.nlsResults = results;
        }
    },
    actions: {
        findTopic({dispatch, commit}, params) {
            commit('resetPlaceNames');

            dispatch('searchFromNimiarkisto', { nameInputValue: params.nameInputValue }).then((result) => {
                // commit('setNimiarkistoResults', result);
            });
            dispatch('searchFromFinto', { nameInputValue: params.nameInputValue }).then((result) => {
                // commit('setYSOResults', result);
            });
            dispatch('searchFromNLS', { nameInputValue: params.nameInputValue }).then((result) => {
                commit('setNLSResults', result);
            });
        },
        async searchFromNLS({dispatch, commit}, params) {
            
            return new Promise((resolve, reject) => {

                commit('setLoadingNLSData', true);

                var requestConfig = {
                    baseURL: BASE_URL,
                    url: "/mml",
                    method: "get",
                    params: {
                        text: params.nameInputValue,
                    }
                };

                axios.request(requestConfig).
                    then(function (response) {
                        console.log(response.data);
                        // for (var i = 0; i < response.data.length; i++) {
                        //     console.log(response.data[i].paikkaid);
                        // }
                        commit('setLoadingNLSData', false);

                        resolve(response.data);

                    }).catch(function (error) {
                        console.log(error);
                        commit('setLoadingNLSData', false);
                        reject(error);
                    });
                });
        },
        async searchFromNimiarkisto ({dispatch, commit}, params) {
            
            return new Promise((resolve, reject) => {

                commit('setLoadingNimiarkistoData', true);

                var requestConfig = {
                    baseURL: BASE_URL,
                    url: "/nimiarkisto",
                    method: "get",
                    params: {
                        text: params.nameInputValue,
                    }
                };

                axios.request(requestConfig).
                    then(function (response) {
                        //console.log(response.data);
                        
                        commit('setNimiarkistoResultLabels', response.data.labels);

                        var dataDetails = [];

                        response.data.dataDetails.forEach(dataDetail => {
                        
                            if (dataDetail.claims.P10025 != undefined && dataDetail.claims.P10025[0].mainsnak.datavalue.value.id == "Q10") {
                                dataDetails.push(dataDetail);
                            }
                        });

                        commit('setLoadingNimiarkistoData', false);
                        commit('setNimiarkistoResultDataDetails', dataDetails);

                        resolve(response.data);
                        
                    }).catch(function (error) {
                        console.log(error);
                        commit('setLoadingNimiarkistoData', false);
                        reject(error);
                    });
            });
        },
        async searchFromFinto ({dispatch, commit}, params) {

            return new Promise((resolve, reject) => {

                this.loadingYSOData = true;
                commit('setLoadingYSOData', true);

                var requestConfig = {
                    baseURL: "http://api.finto.fi/",
                    url: "/rest/v1/yso-paikat/search",
                    method: "get",
                    headers: {
                        "Accept": "application/json"
                    },
                    params: {
                        query: params.nameInputValue + "*",
                        lang: "fi",
                        unique: "true"
                    }
                };

                axios.request(requestConfig).
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

                        commit('setLoadingYSOData', false);
                        commit('setYSOResults', results);

                        results.forEach(element => {
                            dispatch('createYSODetails', {item: element});
                        });

                        resolve(response.data);

                    }).catch(error => {
                        console.log(error);
                        commit('setLoadingYSOData', false);
                        reject(error);
                    });

            });

        },
        async createYSODetails({dispatch, commit}, params) {

            var requestConfig = {
                baseURL: "http://api.finto.fi/",
                url: "/rest/v1/yso-paikat/data",
                method: "get",
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    uri: params.item.uri
                }
            };

            axios.request(requestConfig).
                then(function (response) {

                    var data = {
                        closeMatch: null,
                        broader: null,
                        broaderURL: null,
                        note: null,
                        labels: {
                            fi: null,
                            sv: null,
                            en: null
                        }
                    }

                    console.log(response.data);

                    if (response.data.graph != undefined) {
                        for (var i = 0; i < response.data.graph.length; i++) {
                            if (response.data.graph[i].narrower != undefined &&
                                response.data.graph[i].narrower.uri == params.item.uri) {
                                    //console.log("broader found");
                                for (var j = 0; j < response.data.graph[i].prefLabel.length; j++) {
                                    if (response.data.graph[i].prefLabel[j].lang == "fi") {
                                        data.broader = response.data.graph[i].prefLabel[j].value;
                                        data.broaderURL = response.data.graph[i].uri;
                                        break;
                                    }
                                }
                            }
                            if (response.data.graph[i].uri == params.item.uri) {
                                if (response.data.graph[i]["skos:closeMatch"] != undefined) {
                                    // For getting coordinates below
                                    data.closeMatch = response.data.graph[i]["skos:closeMatch"];
                                }
                                else if (response.data.graph[i]["closeMatch"] != undefined) {
                                    // For getting coordinates below
                                    data.closeMatch = response.data.graph[i]["closeMatch"];
                                }
                                if (response.data.graph[i]["skos:note"] != undefined) {
                                    //console.log(response.data.graph[i]["skos:note"]);
                                    for (var j = 0; j < response.data.graph[i]["skos:note"].length; j++) {
                                        if (response.data.graph[i]["skos:note"][j].lang == "fi") {
                                            data.note = response.data.graph[i]["skos:note"][j].value;
                                            break;
                                        }
                                    }
                                }
                                for (var j = 0; j < response.data.graph[i].prefLabel.length; j++) {
                                    data.labels[response.data.graph[i].prefLabel[j].lang] = response.data.graph[i].prefLabel[j].value;
                                }
                            }
                        }

                        //
                        // Set broader, note and labels
                        //

                        commit('setYSOResultDetails', { item: params.item, data: data });


                        //
                        // Get coordinates
                        //

                        console.log(data);

                        var paikkatiedotURI = null;
                        if (data.closeMatch != null) {
                            for (var i = 0; data.closeMatch.length; i++) {
                                if (data.closeMatch[i].uri.indexOf("paikkatiedot.fi") != -1) {
                                    //console.log(data.closeMatch[i].uri);
                                    if (data.closeMatch[i].uri.indexOf("paikkatiedot.fi/so/") != -1) {
                                        paikkatiedotURI = data.closeMatch[i].uri;
                                    }
                                    break;
                                }
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

                            axios.request(requestConfig).
                                then(function (response) {
                                    //console.log(response.data);

                                    commit('setYSOResultCoordinates', { item: params.item, data: response.data });
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                        else {
                            commit('setYSOResultCoordinates', { item: params.item, data: null });
                        }
                    }
                    else {
                        commit('setYSOResultDetails', { item: params.item, data: data });
                        commit('setYSOResultCoordinates', { item: params.item, data: null });
                    }

                }).catch(error => {
                    console.log(error);
                });
        },
    },
});

function getNLSPlaceType(data) {
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
