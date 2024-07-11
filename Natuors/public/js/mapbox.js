
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoib21rYXItcGF0aWwiLCJhIjoiY2x5Znh5Z3ZyMDU0ZjJqcXlwa2RkbXZkNiJ9.oR13o77X_hckgtCukkm4Kw'

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/omkar-patil/clyh8bpnz00wd01qpcmqs0oi7', // style URL
	scrollZoom:false
	// center: [-118.113491,34.111745], // starting position [lng, lat]
	// zoom: 9, // starting zoom 
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
	//Create marker  
	const el = document.createElement('div');
	el.className = 'marker'

	//Add marker
	new mapboxgl.Marker({
		element:el,
		anchor:'bottom'
	}).setLngLat(loc.coordinates).addTo(map);

	//Add popup

	new mapboxgl.Popup({
		offset: 30
	})
	.setLngLat(loc.coordinates).addTo(map).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
	.addTo(map)
	//extends map bounds to include current location 
	bounds.extend(loc.coordinates)
});

map.fitBounds(bounds,{
	padding: {
			top:200,
			bottom:150,
			left:100,
			right:100
	}
});