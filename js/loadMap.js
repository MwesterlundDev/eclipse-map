'use strict'

var graphicsLayer = {};
var view = {};
var map = {};

var cloudScale,
	tempScale,
	precipScale,
	timeScale;

var CLOUD_BOX_HEIGHT = 24,
	FORCAST_HEIGHT = 750,
	FORCAST_WIDTH = 300,
	MAX_FORCAST = 25;

var cloudColor = d3.rgb(220, 220, 220);

var tempDotColor = d3.rgb(249, 176, 56);

var dateFormat = d3.time.format("%m-%d %H:%M");

require([
	"esri/Map",
	"esri/views/MapView",
	"esri/geometry/Polyline",
	"esri/geometry/Point",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/Graphic",
	"esri/layers/GraphicsLayer",
	"dojo/domReady!"
], function (Map, MapView, Polyline, Point, SimpleLineSymbol, SimpleMarkerSymbol, Graphic, GraphicsLayer) {
	// Code to create the map and view will go here

	map = new Map({
		basemap: "topo"
	});

	view = new MapView({
		container: "map", // Reference to the DOM node that will contain the view
		map: map, // References the map object created in step 3
		center: [-84.0019071, 34.8916961],
		zoom: 9
	});

	
	eclipse.events.register(eclipse.events.WEATHER_LOADED, weatherLoad)
	eclipse.events.register(eclipse.events.HOURLY, hourly)
	eclipse.events.register(eclipse.events.CITY_WEATHER, currentWeatherData)

	init();

	var polyline = new Polyline({
		paths: centerline
	});

	var lineSymbol = new SimpleLineSymbol({
		color: [20, 20, 20], // RGB color values as an array
		width: 4
	});

	var lineAtt = {
		Name: "Solar Eclipse 2017 Aug 21",
		Owner: "Earth",
		Length: "3,456 km"

	}

	var polylineGraphic = new Graphic({
		geometry: polyline,
		symbol: lineSymbol,
		attributes: lineAtt,
		popupTemplate: {
			title: "{Name}",
			content: [{
				type: "fields",
				fieldInfos: [{
					fieldName: "Name"
				}, {
					fieldName: "Owner"
				}, {
					fieldName: "Length"
				}]
			}]
		}
	})

	view.graphics.add(polylineGraphic);

	timelines.forEach(function (line) {

		var timeLine = new Polyline([line.coordinates]);

		var timeLineSymbol = new SimpleLineSymbol({
			color: [20, 20, 20, .5], // RGB color values as an array
			width: 4
		});

		var timeLineAtt = {
			Name: line.name,

		}

		var polytimeLineGraphic = new Graphic({
			geometry: timeLine,
			symbol: timeLineSymbol,
			attributes: timeLineAtt,
			popupTemplate: {
				title: "{Name}",
				content: [{
					type: "fields",
					fieldInfos: [{
						fieldName: "Name"
					}]
				}]
			}
		})
		view.graphics.add(polytimeLineGraphic)
	})



	view.on("click", function (event) {
		// event is the event handle returned after the event fires.

		var lat = event.mapPoint.latitude,
			lon = event.mapPoint.longitude;

		var markerSymbol = new SimpleMarkerSymbol({
			color: [249, 176, 56],

			// outline: { // autocasts as new SimpleLineSymbol()
			// 	color: [120, 120, 120, 1],
			// 	width: 1
			// }
		});

		var pointGraphic = new Graphic({
			geometry: event.mapPoint,
			symbol: markerSymbol,
		});

		view.graphics.add(pointGraphic);

		console.log("lat / long ", lat, lon)

		if (event.button === 2) {
			loadSpinner();
			eclipse.weather.getCitiesByLatLon(lat, lon);
		} else if (event.button === 0) {
			loadSpinner();
			eclipse.weather.getHourlyForcast(lat, lon);
			eclipse.weather.getCityWeather(lat, lon);
		}
	});

	eclipse.weather.getWeather();
	// eclipse.weather.getCitiesByLatLon(35.2018, -83.8241);
	// eclipse.weather.getCitiesByLatLon(32.95667, -79.33333);

});

function init() {

	timeScale = d3.scale.linear()
		.domain([0, 25])
		.range([0, FORCAST_HEIGHT]);

	cloudScale = d3.scale.linear()
		.domain([0, 100])
		.range([0, FORCAST_WIDTH]);

	tempScale = d3.scale.linear()
		.domain([0, 120])
		.range([0, FORCAST_WIDTH]);

	var forcastSvg = d3.select("#forcast-svg");

	// forcastSvg.append("rect")
	// 	.style("fill", d3.rgb(0, 0, 0))
	// 	.attr("x", 0)
	// 	.attr("y", 0)
	// 	.attr("height", FORCAST_HEIGHT)
	// 	.attr("width", FORCAST_WIDTH)

	forcastSvg.append("line")
		.classed("cloudLine", 1)
		.attr("x1", cloudScale(100))
		.attr("x2", cloudScale(100))
		.attr("y1", 0)
		.attr("y2", FORCAST_HEIGHT)

	forcastSvg.append("line")
		.classed("cloudLine", 1)
		.attr("x1", cloudScale(0))
		.attr("x2", cloudScale(0))
		.attr("y1", 0)
		.attr("y2", FORCAST_HEIGHT)
}

function weatherLoad() {

	hideSpinner();

	console.log("weather: ", eclipse.weather.cities)

	var cities = eclipse.weather.cities;

	require([
		"esri/geometry/Point",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/Graphic",

	], function (Point, SimpleMarkerSymbol, Graphic) {

		cities.forEach(function (city) {
			var point = new Point({
				x: city.coord.lon,
				y: city.coord.lat,
				z: 1000
			})

			// console.log("city: ", city)

			var clouds = Math.floor((city.clouds.all / 100) * 20) / 20;

			var markerSymbol = new SimpleMarkerSymbol({
				color: [120, 120, 120, clouds],

				outline: { // autocasts as new SimpleLineSymbol()
					color: [120, 120, 120, 1],
					width: 1
				}
			});

			var cityAttr = {
				Name: city.name,
				Clouds: city.clouds.all + "%",
				Weather: city.weather[0].description
			}

			var pointGraphic = new Graphic({
				geometry: point,
				symbol: markerSymbol,
				attributes: cityAttr,
				popupTemplate: {
					title: "{Name}",
					content: [{
						type: "fields",
						fieldInfos: [{
							fieldName: "Name"
						}, {
							fieldName: "Clouds"
						}, {
							fieldName: "Weather"
						}]
					}]
				}
			});

			view.graphics.add(pointGraphic);
		})

	});
}

function currentWeatherData(data) {

	console.log("current weather: ", data)

	hideSpinner();

	var weather = data.weather[0];
	var main = data.main;
	var clouds = data.clouds;
	var wind = data.wind;

	// var currentWeather = d3.select("#current-weather");

	var nameLabel = d3.select("#weather-name")
	nameLabel.text(weather.main + ":")

	var descLabel = d3.select("#weather-description")
	descLabel.text(weather.description)

	d3.select("#temp").text(main.temp + " F")
	d3.select("#pressure").text(main.pressure + " mmHg")
	d3.select("#humidity").text(main.humidity + "%")
	d3.select("#clouds").text(clouds.all + "%")
	d3.select("#wspeed").text(wind.speed + " mph")
	d3.select("#wdirection").text(wind.deg + " deg")
}

function hourly(data) {
	console.log('hourly data: ', data)

	hideSpinner();

	var city = data.city;

	var weatherData = data.list.filter(function (item, index) {
		if (index < MAX_FORCAST) {
			return item;
		}
	});

	console.log("weather data: ", weatherData)

	var cityDiv = d3.select("#city");

	cityDiv.selectAll(".city-label").remove();

	cityDiv.append("label")
		.attr("id", "city-" + city.id)
		.classed("city-label", 1)
		.text(city.name);

	var forcastSvg = d3.select("#forcast-svg");

	forcastSvg.selectAll(".cloudRect").remove();

	var cloudRect = forcastSvg.selectAll(".cloudRect")
		.data(weatherData)
		.enter()

	cloudRect.append('rect')
		.classed('cloudRect', 1)
		.attr('x', 0)
		.attr('y', function (d, i) {
			// console.log("y: ",  veracityYScale(d.y))
			return timeScale(i) + 2;
		})
		.attr("height", CLOUD_BOX_HEIGHT)
		.attr('width', function (d) {
			return cloudScale(d.clouds.all);
		})
		.style("fill", cloudColor)
		.attr("title", function (d) {
			return d.weather[0].main
		})

	forcastSvg.selectAll(".cloudText").remove();

	var cloudText = forcastSvg.selectAll(".cloudText")
		.data(weatherData)
		.enter()

	cloudText.append('text')
		.classed('cloudText', 1)
		.attr('x', function (d) {
			if (d.clouds.all > 10) {
				return cloudScale(d.clouds.all);
			}
			return 15;
		})
		.attr('y', function (d, i) {
			// console.log("y: ",  veracityYScale(d.y))
			return timeScale(i) + 15;
		})
		.attr("text-anchor", "end")
		.style("fill", d3.rgb(20, 20, 20))
		.text(function (d) {
			return d.clouds.all + "%";
		})

	forcastSvg.selectAll(".weatherText").remove();

	var weatherText = forcastSvg.selectAll(".weatherText")
		.data(weatherData)
		.enter()

	weatherText.append('text')
		.classed('weatherText', 1)
		.attr('x', 500)
		.attr('y', function (d, i) {
			// console.log("y: ",  veracityYScale(d.y))
			return timeScale(i) + 15;
		})
		.attr("text-anchor", "end")
		.style("fill", d3.rgb(220, 220, 220))
		.text(function (d) {
			return d.weather[0].main + " :: " + dateFormat(new Date(d.dt * 1000))
		})

	forcastSvg.selectAll(".tempDot").remove();

	var tempDot = forcastSvg.selectAll(".tempDot")
		.data(weatherData)
		.enter()

	tempDot.append('circle')
		.classed('tempDot', 1)
		.attr('cx', function (d) {
			return tempScale(d.main.temp)
		})
		.attr('cy', function (d, i) {
			// console.log("y: ",  veracityYScale(d.y))
			return timeScale(i) + 15;
		})
		.attr("r", 2)
		.style("fill", tempDotColor)
		.attr("title", function (d) {
			return d.weather[0].main
		})

	forcastSvg.selectAll(".tempText").remove();

	var tempText = forcastSvg.selectAll(".tempText")
		.data(weatherData)
		.enter()

	tempText.append('text')
		.classed('tempText', 1)
		.attr('x', function (d) {
			return tempScale(d.main.temp) + 3
		})
		.attr('y', function (d, i) {
			// console.log("y: ",  veracityYScale(d.y))
			return timeScale(i) + 15;
		})
		.style("fill", d3.rgb(249, 176, 56))
		.text(function (d) {
			return d.main.temp + " F"
		})

}

function loadSpinner() {
	$("#mapShield").show()
}

function hideSpinner() {
	$("#mapShield").hide()
}