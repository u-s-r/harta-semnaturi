var App = {
    judete: {},

    total: 0,

    loadCSV: function () {
        var csvurl = 'assets/data.csv';
        Papa.parse(csvurl, {
            download: true,
            complete: function (results) {
                var data = results.data
                data.sort(function(a,b) {
                    return b[0]/b[1] - a[0]/a[1];
                });
                for (var i = 0, len = data.length; i < len; i++) {
                    var s = parseInt(data[i][0]);
                    if (!isNaN(s)) {
                        App.total += s;
                    }
                    var judet = data[i][2];
                    App.judete[judet] = {
                        signatures: parseInt(data[i][0]),
                        target: parseInt(data[i][1])
                    };
                }
                App.updateStats();
                App.drawMap();
            }
        });
    },
    updateStats: function () {
        var d = document.getElementById('info');
        console.log("EX", App.total/200000);
        d.innerHTML = '<div><b><span>Raportate la nivel național: </span></b><br>' + App.total + ' din 200.000 (' +  Math.floor(App.total/2000) + '%)</b></div>';
    },
    drawMap: function () {
        var map = L.map('map', {
            center: [46.05, 26.5], zoomControl: false,
            maxZoom: 8, minZoom: 6, zoom:6.7
        });


        map.dragging.enable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();


        var info = L.popup({
			closeButton: false
		});


        info.updateInfo = function (props, e) {
			console.log(e);
			if (props && e && props.nume != this._prevCounty) {
				var bounds = e.target.getBounds()
				this.setLatLng(L.latLng(bounds.getNorth(), bounds.getEast() - (bounds.getEast() - bounds.getWest()) / 2) );
				this.setContent('<div class="infoJudet"><h1>' + props.nume + '</h1>'+
                                        '<div><b><span>Semnături:</span>' + props.signatures + '</b></div>' +
                                        '<div><b><span>Ținta:</span>' + props.target + '</b></div>' +
                                        '<div><b><span>Progres:</span>' + ((props.target == 0) ? 0 : Math.floor(props.signatures*100/props.target)) + '%</b></div>' +
                                        '</div>');
				if (map) {
					info.openOn(map);
				}
				this._prevCounty = props.nume;
			} else {
				this._prevCounty = "";
				map.closePopup();
			}
        };


        var scale = chroma.scale(['#ffffff','#0084ff']).domain([0, 100]);
        function getColor(prop) {
			var color;
			if (prop.target == 0) {
				color = "#ffffff";
			} else {
                                //FIXME: s/1000/100/ later.
				color = scale(Math.floor(prop.signatures*1000/prop.target)).toString();
			}
			return color;
        }

        function style(feature) {
            return {
                weight: 3,
                opacity: 1,
                color: '#0084ff',
                fillOpacity: 1,
                fillColor: getColor(feature.properties)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

			layer.setStyle({
				weight: 3,
				color: '#666',
				dashArray: '3',
				fillOpacity: 1
			});

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }

            info.updateInfo(layer.feature.properties, e);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.updateInfo();
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
				click:highlightFeature,
                mouseout: resetHighlight
            });
        }


        for (i = 0; i < geoInfo.features.length; i++) {
            var id = geoInfo.features[i].id;
            if (id && App.judete.hasOwnProperty(id)) {

                geoInfo.features[i].properties.signatures = App.judete[id].signatures;
                geoInfo.features[i].properties.target = App.judete[id].target;
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
