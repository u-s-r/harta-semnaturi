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

		// get color depending on population density value
		function getColor(prop) {
			//FIXME: this shows 10 times the actual intensity, s/1000/100/ later
			var d = prop.target == 0 ? 0 : Math.floor(prop.signatures*1000/prop.target);
			return d >	90	? '#800026' :
			       d >	80	? '#bd0026' :
			       d >	70	? '#e31a1c' :
			       d >	60	? '#fc4e2a' :
			       d >	50      ? '#fd8d3c' :
			       d >	40	? '#feb24c' :
			       d >	30	? '#fed976' :
			       d >	20	? '#ffeda0' :
			                  '#ffffcc';
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
				weight: 2,
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
	          }
		}

		geojson = L.geoJson(geoInfo, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
