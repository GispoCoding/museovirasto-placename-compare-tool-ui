<template>
    <div class="map-page">
        <div id="map" class="map">
            <div id="popup" class="ol-popup">
                <a href="#" id="popup-closer" class="ol-popup-closer"></a>
                <div id="popup-content"></div>
            </div>
        </div>
    </div>
</template>

<script>


export default {
    name: 'MapPage',
    components: {
    },
    data () {
        return {
            map: null,
            zoom: 5,
            center: [27.1, 65.2],
            ysoLayer: null,
            nlsLayer: null,
            nimiarkistoLayer: null,
            wikidataLayer: null
        }
    },
    created () {
    },
    mounted () {
        if (this.map == null) {
            console.log('create map');
            this.createMap();
        }
    },
    computed: {
        placeNames () {
            return this.$store.state.placeNames;
        }
    },
    methods: {
        createMap() {
            var ol = this.$ol;
            this.map = new ol.Map({
                target: document.getElementById('map'),
                layers: [
                    new ol.layer.Tile({
                        source: new this.$ol.source.OSM()
                    })
                ],
                view: new ol.View({
                    center: ol.proj.fromLonLat(this.center),
                    zoom: this.zoom
                })
            });

            this.createMapFeatures();

            this.createPopup();
        },
        createPopup() {
            var ol = this.$ol;
            var element = document.getElementById('popup');
            var _this = this;

            var popup = new ol.Overlay({
                element: element,
                autoPan: true,
                    autoPanAnimation: {
                    duration: 250
                },
                positioning: 'bottom-center',
                //stopEvent: false,
                offset: [7, -4]
            });
            this.map.addOverlay(popup);

            var closer = document.getElementById('popup-closer');
            closer.onclick = function() {
                popup.setPosition(undefined);
                closer.blur();
                return false;
            };

            // display popup on click
            this.map.on('click', function(evt) {
                var feature = _this.map.forEachFeatureAtPixel(evt.pixel,
                function(feature) {
                    return feature;
                });
                if (feature) {
                    var coordinates = feature.getGeometry().getCoordinates();
                    var content = document.getElementById('popup-content');
                    content.innerHTML = feature.get('item').html;
                    popup.setPosition(coordinates);
                    // $(element).popover({
                    //     placement: 'top',
                    //     html: true,
                    //     content: feature.get('name')
                    // });
                    // $(element).popover('show');
                } else {
                    //$(element).popover('destroy');
                }
            });


            // change mouse cursor when over marker
            this.map.on('pointermove', function(e) {
                if (e.dragging) {
                    //$(element).popover('destroy');
                    return;
                }
                var pixel = _this.map.getEventPixel(e.originalEvent);
                var hit = _this.map.hasFeatureAtPixel(pixel);
                //onsole.log(_this.map);
                //console.log(_this.map.getTarget());
                _this.map.getTarget().style.cursor = hit ? 'pointer' : '';
            });
        },
        createMapFeatures() {
            this.createNLSMapFeatures();
            this.createYSOFeatures();
            this.createNimiarkistoFeatures();
            this.createWikidataFeatures();
        },
        createNimiarkistoFeatures() {
            var ol = this.$ol;
            var nimiarkistoFeatures = [];

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: "/static/images/mapiconscollection-markers/assortment-3.png",
                    scale: 0.8
                })
            });

            for (var i = 0; i < this.placeNames.nimiarkistoResults.dataDetails.length; i++) {
                var item = this.placeNames.nimiarkistoResults.dataDetails[i];
                //console.log(item);
                if (item.claims.P10012 != undefined) {
                    var coordinates = item.claims.P10012[0].mainsnak.datavalue.value;
                    //console.log(item.geom.coordinates);
                    var iconFeature = new ol.Feature(
                        {
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([coordinates.longitude, coordinates.latitude])),
                            item: {
                                html: this.createNimiarkistoPopupHtml(item)
                            }
                        }
                    );
                    iconFeature.setStyle(iconStyle);
                    nimiarkistoFeatures.push(iconFeature);
                }
            }

            var vectorSource = new ol.source.Vector({
                features: nimiarkistoFeatures
            });
            if (this.nimiarkistoLayer != null) {
                this.map.removeLayer(this.nimiarkistoLayer);
                this.nimiarkistoLayer = null;
            }
            this.nimiarkistoLayer = new ol.layer.Vector({
                source: vectorSource,
                zIndex: 1000,
            });
            this.nimiarkistoLayer.setZIndex(3);
            console.log("adding nimiarkisto.fi map layer");
            this.map.addLayer(this.nimiarkistoLayer);
        },
        createWikidataFeatures() {
            var ol = this.$ol;
            var wikidataFeatures = [];

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: "/static/images/mapiconscollection-markers/assortment-4.png",
                    scale: 0.8
                })
            });

            for (var i = 0; i < this.placeNames.wikidataResults.dataDetails.length; i++) {
                var item = this.placeNames.wikidataResults.dataDetails[i];
                //console.log(item);
                if (item.claims.P625 != undefined) {
                    var coordinates = item.claims.P625[0].mainsnak.datavalue.value;
                    //console.log(item.geom.coordinates);
                    var iconFeature = new ol.Feature(
                        {
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([coordinates.longitude, coordinates.latitude])),
                            item: {
                                html: this.createWikidataPopupHtml(item)
                            }
                        }
                    );
                    iconFeature.setStyle(iconStyle);
                    wikidataFeatures.push(iconFeature);
                }
            }

            var vectorSource = new ol.source.Vector({
                features: wikidataFeatures
            });
            if (this.wikidataLayer != null) {
                this.map.removeLayer(this.wikidataLayer);
                this.wikidataLayer = null;
            }
            this.wikidataLayer = new ol.layer.Vector({
                source: vectorSource,
                zIndex: 1000,
            });
            this.wikidataLayer.setZIndex(1);
            console.log("adding Wikidata map layer");
            this.map.addLayer(this.wikidataLayer);
        },
        createYSOFeatures() {
            var ol = this.$ol;
            var ysoFeatures = [];

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: "/static/images/mapiconscollection-markers/assortment-2.png",
                    scale: 0.8
                })
            });

            for (var i = 0; i < this.placeNames.ysoResults.length; i++) {
                var item = this.placeNames.ysoResults[i];
                //console.log(item);
                //console.log(item.coordinates);
                if (item.coordinates.lon != null && item.coordinates.lat != null) {
                    var iconFeature = new ol.Feature(
                        {
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([item.coordinates.lon, item.coordinates.lat])),
                            item: {
                                html: this.createYSOPopupHtml(item)
                            }
                        }
                    );
                    iconFeature.setStyle(iconStyle);
                    ysoFeatures.push(iconFeature);
                }
            }

            var vectorSource = new ol.source.Vector({
                features: ysoFeatures
            });
            if (this.ysoLayer != null) {
                this.map.removeLayer(this.ysoLayer);
                this.ysoLayer = null;
            }
            this.ysoLayer = new ol.layer.Vector({
                source: vectorSource,
                zIndex: 1000,
            });
            this.ysoLayer.setZIndex(4);
            console.log("adding YSO-paikat map layer");
            this.map.addLayer(this.ysoLayer);
        },
        createNLSMapFeatures () {
            var ol = this.$ol;
            var nlsFeatures = [];

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: "/static/images/mapiconscollection-markers/assortment-1.png",
                    scale: 0.8
                })
            });

            for (var i = 0; i < this.placeNames.nlsResults.length; i++) {
                var item = this.placeNames.nlsResults[i];
                //console.log(item);
                //console.log(item.geom.coordinates);
                var iconFeature = new ol.Feature(
                    {
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.geom.coordinates[0], item.geom.coordinates[1]])),
                        item: {
                            html: this.createNLSPopupHtml(item)
                        }
                    }
                );
                iconFeature.setStyle(iconStyle);
                nlsFeatures.push(iconFeature);
            }

            var vectorSource = new ol.source.Vector({
                features: nlsFeatures
            });
            if (this.nlsLayer != null) {
                this.map.removeLayer(this.nlsLayer);
                this.nlsLayer = null;
            }
            this.nlsLayer = new ol.layer.Vector({
                source: vectorSource,
                zIndex: 1000,
            });
            this.nlsLayer.setZIndex(2);
            console.log("adding NLS map layer");
            this.map.addLayer(this.nlsLayer);
        },
        createNimiarkistoPopupHtml (item) {
            var html = '<p><b>Termi:</b><a href="https://nimiarkisto.fi/wiki/' + item.id +'" target="_blank"><b>' + item.labels.fi.value + '</b></a></p>';
            html += '<p>Koordinaatit: ' + this.getNimiarkistoCoordinates(item) + '</p>';
            html += '<p>Paikanlaji:' + this.getNimiarkistoCollectedPlaceType(item) + '</p>';
            html += '<p>Tekn info URL:<a href="https://nimiarkisto.fi/wiki/' + item.title + '" target="_blank">' + item.title + '</p>';
            return html;
        },
        createWikidataPopupHtml (item) {
            var html = '<p><b>Termi:</b><a href="https://www.wikidata.org/wiki/' + item.id +'" target="_blank"><b>' + this.getWikidataTitle(item) + '</b></a></p>';
            html += '<p>Koordinaatit: ' + this.getWikidataCoordinates(item) + '</p>';
            html += '<p>Tyyppi: ' + this.getWikidataInstanceOf(item) + '</p>';
            html += '<p>Kuvaus: ' + this.getWikidataDescription(item) + '</p>';;
            return html;
        },
        createYSOPopupHtml (item) {
            var html = '<p><b>Termi:</b> <a href="' + item.uri +'" target="_blank"><b>' + item.prefLabel + '</b></a></p>';
            html += '<p>Koordinaatit: ' + item.coordinateText + '</p>';
            html += '<p>Paikanlaji:' + item.placeType + '</p>';
            html += '<p>Osa käsitettä: '
            if (item.broader.name != '-') {
                html += '<a href="' + item.broader.url + '" target="_blank">' + item.broader.name + '</a>';
            }
            else {
                html += item.broader.name;
            }
            html += '</p>'
            html += '<p>Huom: ' + item.note + '</p>';
            return html;
        },
        createNLSPopupHtml (item) {
            var html = '<p><b>Termi:</b> <a href="http://paikkatiedot.fi/so/1000772/' + item.paikkaid + '" target="_blank"><b>' + item.kirjoitusasu + '</b></a></p>';
            html += '<p>Koordinaatit: ' + this.getNLSCoordinates(item) + '</p>';
            html += '<p>Paikanlaji: ' + this.getNLSCollectedPlaceType(item) + '</p>';
            html += '<p>Kunta: ' + item.kunta +  '</p>';
            return html;
        },
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
                        text += label.labels.fi != undefined ? label.labels.fi.value : label.labels.en.value;
                        text += ", ";
                        // console.log(label.labels);
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
    },
    watch: {
        placeNames: {
            handler (names) {
                console.log('placeNames changes');
                this.createMapFeatures();
            },
            deep: true
        }
    }

}
</script>

<style scoped>

.map-page {
    width: 100%;
    height: calc(100% - 172px);
    margin-top: -18px;
    position: relative;
}

#map {
  width: 100%;
  height: 100%;
}

.ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 280px;
}
.ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}
.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}
.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}
.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}
.ol-popup-closer:after {
    content: "✖";
}

</style>