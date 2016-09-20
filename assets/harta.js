var App = {
    judete: {},

    loadCSV: function () {
        var csvurl = 'assets/data.csv';
        Papa.parse(csvurl, {
            download: true,
            complete: function (results) {
                for (var i = 0, len = results.data.length; i < len; i++) {
                    var judet = results.data[i][2];
                    App.judete[judet] = {
                        signatures: results.data[i][0],
                        target: results.data[i][1]
                    };
                }
                App.drawMap();
            }
        });
    },
    drawMap: function () {
        var map = L.map('map', {
            center: [46.05, 26.5], zoomControl: false,
            maxZoom: 7, minZoom: 7, zoom: 7
        });


        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();


        // control that shows state info on hover
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = ( props ?
            '<div class="infoJudet"><h1>' + props.nume + '</h1><div><b><span>Semnături:</span>' + props.signatures + '</b></div>' : '')
        };

        info.addTo(map);

        // get color depending on population density value
		var scale = chroma.scale(['#ffffff','#0084ff']).domain([0, 10000]);
        function getColor(prop) {
			var color;
			if (prop.scale) {
				color = prop.scale(prop.signatures).toString();
			} else {
				color = scale(prop.signatures).toString();
			}
			return color;
        }

        function style(feature) {
            return {
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

			layer.setStyle({
				weight: 4,
				color: '#666',
				dashArray: '3',
				fillOpacity: 0.7
			});

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }


        for (i = 0; i < geoInfo.features.length; i++) {
            var id = geoInfo.features[i].id;
            if (id && App.judete.hasOwnProperty(id)) {

                geoInfo.features[i].properties.signatures = App.judete[id].signatures;
                geoInfo.features[i].properties.target = App.judete[id].target;
				geoInfo.features[i].properties.scale = chroma.scale(['#ffffff','#0084ff']).domain([0, App.judete[id].target]);
            }
        }

        geojson = L.geoJson(geoInfo, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }
};
(function () { //ready
    App.loadCSV();
})();
