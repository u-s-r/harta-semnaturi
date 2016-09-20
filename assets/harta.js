		var map = L.map('map', {
			center: [46.05, 26.5],zoomControl: false,
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
			this._div.innerHTML =  ( props?
			    '<div class="infoJudet"><h1>' + props.nume + '</h1><div><b><span>Semnături:</span>' +props.signatures+'</b></div>':'')
		};

		info.addTo(map);
		var scale = chroma.scale(['#ffffff','#0084ff']).domain([0, 10000]);
		// get color depending on population density value
		function getColor(prop) {
			var color;
			console.log(prop);
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
				color: '#0084ff',
				fillOpacity: 1,
				fillColor: getColor(feature.properties),
				strokeColor: '#0084ff'
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



		for (i = 0; i< geoInfo.features.length; i++) {
		  var f = signatures[geoInfo.features[i].id]
		  if (f != null ) {
		      geoInfo.features[i].properties.signatures = f[0]
		      geoInfo.features[i].properties.target = f[1]
			  console.log(geoInfo.features[i].id, f[1]);
			  geoInfo.features[i].properties.scale = chroma.scale(['#ffffff','#0084ff']).domain([0, f[1]]);
	          }
		}

		geojson = L.geoJson(geoInfo, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
