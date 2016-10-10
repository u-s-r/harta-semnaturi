var App = {
    judete: {},

    total: 0,

    data: [],

    loadCSV: function () {
        var csvurl = 'assets/data.csv';
        Papa.parse(csvurl, {
            skipEmptyLines: true,
            download: true,
            complete: function (results) {
                var data = results.data
                for (var i = 0; i < data.length; i++) {
                // CATCH empty strings
                    if (!data[i][1]) {
                        data[i][1] = 1000;
                    }
                }
                data.sort(function(a,b) {
                    return b[0]/b[1] - a[0]/a[1];
                });
                for (var i = 0; i < data.length; i++) {
                    var s = parseInt(data[i][0]);
                    if (!isNaN(s)) {
                        App.total += s;
                    }
                    var judet = data[i][2];
                    App.judete[judet] = {
                        signatures: parseInt(data[i][0]),
                        target: parseInt(data[i][1]),
                        place: i+1,
                    };
                }
                App.data = data;
                App.drawMap();
            }
        });
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
				this.setContent('<div class="infoJudet"><h1>' + props.nume + (typeof(props.place)==='undefined'?'':' (locul '+props.place+')')+'</h1>'+
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


        var scale = chroma.scale(['red','yellow','green']).domain([0, 0.2, 1]);
        function getColor(signatures, target) {
			var color;
			if (target == 0) {
				color = "#ffffff";
			} else {
				color = scale(signatures/target).toString();
			}
			return color;
        }

        function style(feature) {
            return {
                weight: 3,
                opacity: 1,
                color: 'grey',
                fillOpacity: 1,
                fillColor: getColor(feature.properties.signatures, feature.properties.target)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

			layer.setStyle({
				weight: 3,
				color: 'red',
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


        function rowStat(d) {
            return d[2]+' '+Math.floor(d[0]*100/d[1]) + '% ('+d[0]+'/'+d[1]+')';
        }

        function updateStats (data) {
            var d = document.getElementById('stats');
            var top = '<br><h3>Clasament</h3><div id="top">';
            for (var i = 0; i < data.length; i++) {
                top += '<div'+
                    //Uncomment for color background in chart.
                    ' style="background:' + getColor(data[i][0], data[i][1]) + '"' +
                    '><b>' + (i+1)+'. '+rowStat(data[i])+'</b></div>';
            }
            top +='</div>';
            d.innerHTML = '<div><b>Semnături raportate național:</b><br>' + App.total + ' din 200.000 (' +  Math.floor(App.total/2000) + '%)</b></div>'+top;
        }

        function addLegend() {
            var legend = L.control({position: 'bottomleft'});

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'legend'),
                grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                labels = [];

                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length-1; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1, 100) + '"></i> ' +
                        (grades[i] + '&ndash;' + grades[i + 1] + '%<br>');
                }
                return div;
            };

            legend.addTo(map);
        }

        for (i = 0; i < geoInfo.features.length; i++) {
            var id = geoInfo.features[i].id;
            if (id && App.judete.hasOwnProperty(id)) {

                geoInfo.features[i].properties.signatures = App.judete[id].signatures;
                geoInfo.features[i].properties.target = App.judete[id].target;
                geoInfo.features[i].properties.place = App.judete[id].place;
            }
        }

        addLegend();
        updateStats(App.data);

        geojson = L.geoJson(geoInfo, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }
};
(function () { //ready
    App.loadCSV();
})();
