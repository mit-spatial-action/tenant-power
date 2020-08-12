$('#disclaimer').modal('show');

const map = new mapboxgl.Map({
    container: 'map',
    accessToken: mapboxgl.accessToken,
    style: 'mapbox://styles/ericrobskyhuntley/ckd62zeup16we1hpia9fcacdw?optimize=true', // stylesheet location
    center: [-71.057083, 42.361145], // starting position [lng, lat]
    zoom: 13, // starting zoom,
    customAttribution: '<u class="data"><a href="https://mutualaidmamas.com/" target="_blank">MAMAS Housing Justice</a></u>, <u class="data"><a href="https://geo-graphe.org"  target="_blank">Graphe</a></u>'
});

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    flyTo: false
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

const clstUrl = 'props/clst';
const xyUrl = 'props/xy';

getResults = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

let currentMarker = null;
let activeProperty = null;
let currentClst = null;
let resultState = false;

titleCase = (string) => {
    return (string.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' '))
}

cityName = (abb) => {
    if (abb == 'som') {
        return ('Somerville, MA');
    } else if (abb == 'cam') {
        return ('Cambridge, MA');
    } else if (abb == 'med') {
        return ('Medford, MA');
    } else if (abb == 'brk') {
        return ('Brookline, MA');
    } else if (abb == 'bos') {
        return ('Boston, MA');
    }
}

makeArrowMarker = (p) => {
    let latlng = new mapboxgl.LngLat(p.lon, p.lat);
    let el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(media/down_arrow.svg)';
    el.style.width = '2rem';
    el.style.height = '2rem';
    el.style.backgroundSize = 'contain';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.marginTop = '-1.25rem';
    currentMarker = new mapboxgl.Marker(el).setLngLat(latlng).addTo(map);
}

csvFromJSON = (json) => {
    // null value handler
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(json[0].properties);
    let csv = json.map(row => header.map(fieldName => JSON.stringify(row.properties[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    return csv
}

listResults = (features) => {
    // let property = document.getElementById('search-results');
    // while (property.firstChild) {
    //     property.removeChild(property.firstChild);
    // }
    let ls = document.getElementById('left-sidebar');
    ls.style.display = 'block';
    let rs = document.getElementById('right-sidebar');
    rs.style.display = 'none';
    let closest = features[0];
    let props = closest.properties;
    let closestProp = document.getElementsByClassName('closest-card');
    // console.log(closestProp.length);
    if (closestProp.length > 0) {
        let nearby = document.getElementById('nearby');
        if (Object.keys(features.slice(1)).length > 1) {
            features.slice(1).forEach(function (prop) {
                let p = prop.properties;
                let listing = nearby.appendChild(document.createElement('div'));
                listing.id = 'property-' + p.id;
                listing.className = 'property card';
                let cardHeader = listing.appendChild(document.createElement('div'));
                cardHeader.className = 'card-title-block';
                let address = cardHeader.appendChild(document.createElement('h3'));
                address.className = 'address card-title';
                address.id = 'address-' + p.id;
                if (p.unit) {
                    address.innerHTML =  `${p.prop_addr}, Unit ${p.unit}`;
                } else {
                    address.innerHTML = p.prop_addr;
                }
                let city = cardHeader.appendChild(document.createElement('h4'));
                city.className = 'city card-subtitle';
                city.id = 'city-' + p.id;
                city.innerHTML = cityName(p.town);
                let bodyText = '';
                if (p.co) {
                    bodyText = `The owners as of <u class="data">${p.year}</u>, 
                        <u class="data">${p.own}</u> and <u class="data">${p.co}</u>, 
                        may own <u class="data">${p.count}</u>`
                } else {
                    bodyText = `The owner as of <u class="data">${p.year}</u>, 
                        <u class="data">${p.own}</u>, 
                        may own <u class="data">${p.count}</u>`
                }
                if (p.count > 1){
                    bodyText = bodyText + ` properties.`
                } else {
                    bodyText = bodyText + ` property.`
                }
                let body = listing.appendChild(document.createElement('div'));
                body.className = 'body';
                body.id = 'body-' + p.id;
                body.innerHTML = bodyText;
                listing.addEventListener('mouseover', function (e) {
                    if (currentMarker) {
                        currentMarker.remove();
                    }
                    makeArrowMarker(p);
                    this.classList.add('active');
                })
                listing.addEventListener('mouseleave', function () {
                    if (currentMarker) {
                        currentMarker.remove();
                    }
                    this.classList.remove('active');
                })
                address.addEventListener('mouseover', function () {
                    // let activeItem = document.getElementsByClassName('active');
                    // if (activeItem[0]) {
                    //     activeItem[0].classList.remove('active');
                    // }
                    this.classList.add('active');
                })
                address.addEventListener('mouseleave', function () {
                    this.classList.remove('active');
                })
                address.addEventListener('click', function () {
                    currentClst = p.clst;
                    const qUrl = `${clstUrl}/${currentClst}`;
                    addPoints(qUrl);
                    while (close.firstChild) {
                        close.removeChild(close.firstChild);
                    }
                });
            })
        } else {
            let listing = nearby.appendChild(document.createElement('div'));
            // listing.id = 'property-' + p.id;
            listing.className = 'property card';
            let cardHeader = listing.appendChild(document.createElement('div'));
            cardHeader.className = 'card-title-block';
            let none = cardHeader.appendChild(document.createElement('div'));
            none.className = 'body';
            // address.id = 'address-' + p.id;
            none.innerHTML = 'No nearby properties found.';
        }
    } else {
        let close = document.getElementById('closest');
        let closestDiv = close.appendChild(document.createElement('div'));
        while (closestDiv.firstChild) {
            closestDiv.removeChild(closestDiv.firstChild);
        }
        closestDiv.id = 'property-' + props.id;
        closestDiv.className = 'card closest-card';
        let closestAdd = closestDiv.appendChild(document.createElement('h1'));
        closestAdd.className = 'address card-title';
        closestAdd.id = 'address-' + props.id;
        // closestAdd.innerHTML = props.prop_addr;
        if (props.unit) {
            closestAdd.innerHTML =  `${props.prop_addr}, Unit ${props.unit}`;
        } else {
            closestAdd.innerHTML = props.prop_addr;
        }
        let closestCity = closestDiv.appendChild(document.createElement('h2'));
        closestCity.className = 'city card-subtitle';
        closestCity.id = 'city-' + props.id;
        closestCity.innerHTML = cityName(props.town);
        let closestText = '';
        if (props.co) {
            closestText = `The owners as of <u class="data">${props.year}</u>, 
                <u class="data">${props.own}</u> and <u class="data">${props.co}</u>, 
                may own <u class="data">${props.count}</u>`
        } else {
            closestText = `The owner as of <u class="data">${props.year}</u>, 
                <u class="data">${props.own}</u>, 
                may own <u class="data">${props.count}</u>`
        }
        if (props.count > 1){
            closestText = closestText + ` properties.`
        } else {
            closestText = closestText + ` property.`
        }
        let closestBody = closestDiv.appendChild(document.createElement('div'));
        closestBody.id = 'body-' + props.id;
        closestBody.className = 'body';
        closestBody.innerHTML = closestText;
        closestAdd.addEventListener('click', function (e) {
            currentClst = props.clst;
            const qUrl = `${clstUrl}/${currentClst}`;
            addPoints(qUrl);
            while (close.firstChild) {
                close.removeChild(close.firstChild);
            }
        })
        let buttonRow = closestDiv.appendChild(document.createElement('div'));
        buttonRow.className = 'btn-toolbar';
        buttonRow.role = 'toolbar';
        let buttonGroup = buttonRow.appendChild(document.createElement('div'));
        buttonGroup.className = 'btn-group mr-2';
        buttonGroup.role = 'group';
        let button = buttonGroup.appendChild(document.createElement('button'));
        button.type = 'button';
        button.className = 'btn btn-secondary';
        let buttonLink = button.appendChild(document.createElement('a'));
        buttonLink.innerHTML = '<u class="data">See Nearby Properties→</u>';
        button.addEventListener('mouseover', function () {
            this.classList.add('active');
        })
        button.addEventListener('mouseleave', function () {
            this.classList.remove('active');
        })
        button.addEventListener('click', function () {
            this.style.display = 'none';
            const qUrl = `${xyUrl}/${props.lon}/${props.lat}/100`;
            addPoints(qUrl);
        })
    }
}

listProperties = (cluster) => {
    let first = cluster[0];
    let props = first.properties;
    let ls = document.getElementById('left-sidebar');
    ls.style.display = 'none';
    let rs = document.getElementById('right-sidebar');
    rs.style.display = 'block';
    let llProps = document.getElementById('ll-props');
    let llInfo = document.getElementById('ll-info');
    let closest = document.getElementById('closest');
    let nearby = document.getElementById('nearby');
    while (nearby.firstChild) {
        nearby.removeChild(nearby.firstChild);
    }
    while (closest.firstChild) {
        closest.removeChild(closest.firstChild);
    }
    while (llInfo.firstChild) {
        llInfo.removeChild(llInfo.firstChild);
    }
    let llDiv = llInfo.appendChild(document.createElement('div'));
    llDiv.className = 'card';
    let llName = llDiv.appendChild(document.createElement('h1'));
    llName.className = 'll-name card-title';
    llName.id = 'll-own-' + props.clst;
    llName.innerHTML = props.own;
    let llBody = llDiv.appendChild(document.createElement('div'));
    llBody.className = 'll-body body';
    llBody.id = 'll-body-' + props.clst;
    llBody.innerHTML = `We found <u class="data">${props.count}</u> potential properties.`
    let buttonRow = llDiv.appendChild(document.createElement('div'));
    buttonRow.className = 'btn-toolbar';
    buttonRow.role = 'toolbar';
    let buttonCSVGroup = buttonRow.appendChild(document.createElement('div'));
    buttonCSVGroup.className = 'btn-group mr-2';
    buttonCSVGroup.role = 'group';
    let buttonCSV = buttonCSVGroup.appendChild(document.createElement('button'));
    buttonCSV.type = 'button';
    buttonCSV.className = 'btn btn-secondary';
    let buttonCSVLink = buttonCSV.appendChild(document.createElement('a'));
    buttonCSVLink.innerHTML = '<u class="data">CSV→</u>';
    buttonCSV.addEventListener('mouseover', function () {
        this.classList.add('active');
        let csv = csvFromJSON(cluster);
        let blob = new Blob([csv], {type: 'text/csv'});
        buttonCSVLink.href = window.URL.createObjectURL(blob);
        buttonCSVLink.download = "property_list.csv";
        buttonCSVLink.dataset.downloadurl = ['text/csv', buttonCSVLink.download, buttonCSVLink.href].join(':');
    })
    buttonCSV.addEventListener('mouseleave', function () {
        this.classList.remove('active');
    })
    let buttonJSONGroup = buttonRow.appendChild(document.createElement('div'));
    buttonJSONGroup.className = 'btn-group mr-2';
    buttonJSONGroup.role = 'group';
    let buttonJSON = buttonJSONGroup.appendChild(document.createElement('button'));
    buttonJSON.type = 'button';
    buttonJSON.className = 'btn btn-secondary';
    let buttonJSONLink = buttonJSON.appendChild(document.createElement('a'));
    buttonJSONLink.innerHTML = '<u class="data">GeoJSON→</u>';
    buttonJSON.addEventListener('mouseover', function () {
        this.classList.add('active');
        let validGeoJSON = geoJSON = `{
            "type": "FeatureCollection",
            "features": ${JSON.stringify(cluster)}
        }`
        let blob = new Blob([validGeoJSON], {type: 'text/json'});
        buttonJSONLink.href = window.URL.createObjectURL(blob);
        buttonJSONLink.download = "property_list.geojson";
        buttonJSONLink.dataset.downloadurl = ['text/json', buttonJSONLink.download, buttonJSONLink.href].join(':');
    })
    buttonJSON.addEventListener('mouseleave', function () {
        this.classList.remove('active');
    })
    let buttonInfoGroup = buttonRow.appendChild(document.createElement('div'));
    buttonInfoGroup.className = 'btn-group mr-2';
    buttonInfoGroup.role = 'group';
    let buttonInfo = buttonInfoGroup.appendChild(document.createElement('button'));
    buttonInfo.type = 'button';
    buttonInfo.className = 'btn btn-secondary';
    let buttonInfoLink = buttonInfo.appendChild(document.createElement('a'));
    buttonInfoLink.innerHTML = '<u class="data">Tell Me More→</u>';
    buttonInfo.addEventListener('mouseover', function () {
        this.classList.add('active');
    })
    buttonInfo.addEventListener('mouseleave', function () {
        this.classList.remove('active');
    })
    buttonInfo.addEventListener('click', function () {
        $('#about').modal('show');
    })
    cluster.forEach(function (prop) {
        let p = prop.properties;
        let listing = llProps.appendChild(document.createElement('div'));
        listing.id = 'property-' + p.id;
        listing.className = 'property card';
        let cardHeader = listing.appendChild(document.createElement('div'));
        cardHeader.className = 'card-title-block';
        let address = cardHeader.appendChild(document.createElement('h3'));
        address.className = 'address card-title';
        address.id = 'address-' + p.id;
        if (p.unit) {
            address.innerHTML =  `${p.prop_addr}, Unit ${p.unit}`;
        } else {
            address.innerHTML = p.prop_addr;
        }
        let city = cardHeader.appendChild(document.createElement('h4'));
        city.className = 'city card-subtitle';
        city.id = 'city-' + p.id;
        city.innerHTML = cityName(p.town);
        let bodyText = '';
        if (p.co) {
            bodyText = `In <u class="data">${p.year}</u>, this property was owned by <u class="data">${p.own}</u> and <u class="data">${p.co}</u>, whose mailing address was <u class="data">${p.own_addr}</u>. Its assessed value was $<u>${Number(p.ass_val).toLocaleString('en-US')}</u>`;
        } else {
            bodyText = `In <u class="data">${p.year}</u>, this property was owned by <u class="data">${p.own}</u>, whose mailing address was <u class="data">${p.own_addr}</u>. Its assessed value was $<u>${Number(p.ass_val).toLocaleString('en-US')}</u>`;
        }
        let body = listing.appendChild(document.createElement('div'));
        body.className = 'body';
        body.id = 'body-' + p.id;
        body.innerHTML = bodyText;
        listing.addEventListener('mouseover', function (e) {
            if (currentMarker) {
                currentMarker.remove();
            }
            makeArrowMarker(p);
            this.classList.add('active');
        })
        listing.addEventListener('mouseleave', function () {
            if (currentMarker) {
                currentMarker.remove();
            }
            this.classList.remove('active');
        })
        address.addEventListener('mouseover', function () {
            // let activeItem = document.getElementsByClassName('active');
            // if (activeItem[0]) {
            //     activeItem[0].classList.remove('active');
            // }
            this.classList.add('active');
        })
        address.addEventListener('mouseleave', function () {
            this.classList.remove('active');
        })
        address.addEventListener('click', function () {
            map.flyTo({
                center: [p.lon, p.lat],
                zoom: 18,
                speed: 0.9,
            })
        });
    })
}

addPoints = async (url) => {
    let geojson = await getResults(url);
    if (geojson.features) {
        if (currentClst) {
            listProperties(geojson.features);
        } else {
            listResults(geojson.features);
        }
        let bbox = turf.extent(geojson);
        let centroids = {
            type: 'FeatureCollection',
            features: geojson.features.map(function(feat) {
                return {
                    type: 'Feature',
                    properties: feat.properties,
                    geometry: turf.centroid(feat).geometry
                }
            })
        };
        if (map.getSource('nearby')) {
            map.removeLayer('prop-polys');
            map.removeLayer('prop-line');
            map.removeLayer('prop-circle');
            map.removeSource('nearby');
            map.removeSource('nearby-centroids');
        }
        map.addSource('nearby', {
            'type': 'geojson',
            'data': geojson,
            'generateId': true
        });
        map.addSource('nearby-centroids', {
            'type': 'geojson',
            'data': centroids,
            'generateId': true
        });

        // Add layer.
        map.addLayer({
            'id': 'prop-polys',
            'type': 'fill',
            'source': 'nearby',
            'minzoom': 14,
            'paint': {
                'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    0,
                    18,
                    1
                ],
                'fill-color': 'red'
            }
        });
        map.addLayer({
            'id': 'prop-line',
            'type': 'line',
            'source': 'nearby',
            'minzoom': 14,
            'paint': {
                'line-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    0,
                    18,
                    1
                ],
                'line-width': 3,
                'line-color': 'white'
            }
        });
        map.addLayer({
            'id': 'prop-circle',
            'type': 'circle',
            'source': 'nearby-centroids',
            'maxzoom': 17,
            'paint': {
                'circle-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    1,
                    17,
                    0
                ],
                'circle-stroke-width': 3,
                'circle-stroke-color': 'white',
                'circle-stroke-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    1,
                    17,
                    0
                ],
                'circle-color': 'red',
                'circle-radius': 10
            }
        });

        map.on('mouseenter', 'prop-polys', function (e) {
            map.getCanvas().style.cursor = 'pointer';
            p = e.features[0].properties;
            if (currentMarker) {
                currentMarker.remove();
            }
            activeProperty = document.getElementById('property-' + p.id);
            activeProperty.classList.add('active');
            makeArrowMarker(p);
        });
        map.on('mouseleave', 'prop-polys', function () {
            map.getCanvas().style.cursor = '';
            if (activeProperty) {
                activeProperty.classList.remove('active');
            }
            if (currentMarker) {
                currentMarker.remove();
            }
        });
        map.on('click', 'prop-polys', function (e) {
            let clickedProperty = e.features[0].properties.id;
            let elmnt = document.getElementById('property-' + clickedProperty);
            elmnt.scrollIntoView({
                behavior: 'smooth'
            })
            map.flyTo({
                center: [e.features[0].properties.lon, e.features[0].properties.lat],
                zoom: 18,
                speed: 0.9,
            })
        });
        map.on('mouseenter', 'prop-circle', function (e) {
            map.getCanvas().style.cursor = 'pointer';
            p = e.features[0].properties;
            if (currentMarker) {
                currentMarker.remove();
            }
            activeProperty = document.getElementById('property-' + p.id);
            activeProperty.classList.add('active');
            makeArrowMarker(p);
        });
        map.on('mouseleave', 'prop-circle', function () {
            map.getCanvas().style.cursor = '';
            if (activeProperty) {
                activeProperty.classList.remove('active');
            }
            if (currentMarker) {
                currentMarker.remove();
            }
        });
        map.on('click', 'prop-circle', function (e) {
            let clickedProperty = e.features[0].properties.id;
            let elmnt = document.getElementById('property-' + clickedProperty);
            elmnt.scrollIntoView({
                behavior: 'smooth'
            })
            map.flyTo({
                center: [e.features[0].properties.lon, e.features[0].properties.lat],
                zoom: 18,
                speed: 0.9,
            })
        });
        map.fitBounds(bbox, { maxZoom: 17 });
    }
}

map.on('load', () => {
    map.addSource('prop-tiles', {
        type: 'vector',
        url: 'mapbox://ericrobskyhuntley.904c4kq4'
    });
    map.addLayer({
        'id': 'prop-backdrop',
        'type': 'circle',
        'source': 'prop-tiles',
        'source-layer': 'test-90w35b',
        'layout': {
            'circle-sort-key': ['get', 'count']
        },
        'paint': {
            'circle-color': 'white',
            'circle-blur': 1,
            'circle-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0.3,
                14, 0.1
            ],
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 2,
                22, 20
            ]
        }
    });
    geocoder.on('result', function (e) {
        let ls = document.getElementById('left-sidebar');
        ls.style.display = 'block';
        let rs = document.getElementById('right-sidebar');
        rs.style.display = 'none';
        const geocodelngLat = e.result.geometry.coordinates;
        const qUrl = `${xyUrl}/${geocodelngLat[0]}/${geocodelngLat[1]}/1`;
        addPoints(qUrl);
        if (currentClst) {
            currentClst = null;
            let llInfo = document.getElementById('ll-info');
            while (llInfo.firstChild) {
                llInfo.removeChild(llInfo.firstChild);
            }
            let llProp = document.getElementById('ll-props');
            while (llProp.firstChild) {
                llProp.removeChild(llProp.firstChild);
            }
        }
    });
    geocoder.on('clear', function(e) {
        let llProps = document.getElementById('ll-props');
        let llInfo = document.getElementById('ll-info');
        let closest = document.getElementById('closest');
        let nearby = document.getElementById('nearby');
        let properties = document.getElementById('properties');
        properties.style.display = 'none';
        while (nearby.firstChild) {
            nearby.removeChild(nearby.firstChild);
        }
        while (closest.firstChild) {
            closest.removeChild(closest.firstChild);
        }
        while (llInfo.firstChild) {
            llInfo.removeChild(llInfo.firstChild);
        }
        while (llProps.firstChild) {
            llProps.removeChild(llProps.firstChild);
        }
    });
    geocoder.on('results', function(e) {
        let closest = document.getElementById('closest');
        let nearby = document.getElementById('nearby');
        let ls = document.getElementById('left-sidebar');
        ls.style.display = 'none';
        let rs = document.getElementById('right-sidebar');
        rs.style.display = 'none';
        while (nearby.firstChild) {
            nearby.removeChild(nearby.firstChild);
        }
        while (closest.firstChild) {
            closest.removeChild(closest.firstChild);
        }
    });

    map.on('mouseover', 'prop-backdrop', function (e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'prop-backdrop', function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', 'prop-backdrop', (e) => {
        let coordinates = e.lngLat;
        let description = "<u id='here' class='data'>What's here?</u>";
        let popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        let here = document.getElementById('here');
        here.addEventListener('click', function () {
            if (currentMarker) {
                currentMarker.remove();
            }
            const qUrl = `${xyUrl}/${coordinates.lng}/${coordinates.lat}/1`;
            addPoints(qUrl);
            let llProps = document.getElementById('ll-props');
            let llInfo = document.getElementById('ll-info');
            let closest = document.getElementById('closest');
            let nearby = document.getElementById('nearby');
            let properties = document.getElementById('properties');
            properties.style.display = 'block';
            while (nearby.firstChild) {
                nearby.removeChild(nearby.firstChild);
            }
            while (closest.firstChild) {
                closest.removeChild(closest.firstChild);
            }
            while (llInfo.firstChild) {
                llInfo.removeChild(llInfo.firstChild);
            }
            while (llProps.firstChild) {
                llProps.removeChild(llProps.firstChild);
            }
            popup.remove();
            currentClst = null;
        })
    })

});