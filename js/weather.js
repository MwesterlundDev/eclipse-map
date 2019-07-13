'use strict'

!function () {

	eclipse.weather = {

		cities: [],
		getWeather: function () {
			$.get("http://api.openweathermap.org/data/2.5/find?lat=34.8916961&lon=-84.0019071&cnt=50&appid=12d60babdb99316dd883f804fc060636", function (data) {
				console.log("Current Weather: ", data)
				// callback(data)

				if (data.list) {
					eclipse.weather.cities = data.list;
				}
				eclipse.events.send(eclipse.events.WEATHER_LOADED, true)
			})

		},
		
		getCitiesByLatLon: function(lat,lon) {
			$.get("http://api.openweathermap.org/data/2.5/find?lat=" + lat + "&lon=" + lon + "&cnt=50&appid=12d60babdb99316dd883f804fc060636", function (data) {
				console.log("Current Weather: ", data)
				// callback(data)

				if (data.list) {
					eclipse.weather.cities = data.list;
				}
				eclipse.events.send(eclipse.events.WEATHER_LOADED, true)
			})
		},

		getHourlyForcast:  function (lat, lon) {
			$.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=12d60babdb99316dd883f804fc060636", function (data) {
				console.log("Hourly forcast: ", data)
				// callback(data)

				eclipse.events.send(eclipse.events.HOURLY, data)
			})
		},

		getCityWeather:  function (lat, lon) {
			$.get("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=12d60babdb99316dd883f804fc060636", function (data) {
				console.log("City Weather forcast: ", data)
				// callback(data)

				eclipse.events.send(eclipse.events.CITY_WEATHER, data)
			})
		}
		
		

	}
}();