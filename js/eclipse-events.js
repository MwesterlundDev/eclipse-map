!function() {
	/**
	 * Contains the "event" name to array of fn. 
	 */
	var registered = {};

	// could use d3.dispatch, but only a single listener per type
	// unless unique namespaces used
	//var dispatcher = d3.dispatch;

	eclipse.events = {
		WEATHER_LOADED: "weather_loaded",
		HOURLY: "hourly",
		CITY_WEATHER: "city_weather",
		
		/**
		 * Regsisters a function to listen for an event to be dispatched.
		 * Both parameters must be defined to register.
		 * 
		 * @param {String} event a non-null event
		 * @param {Function} fn a non-null function (prototype: function(data))
		 * @param {Object} scope the scope on which to call the function
		 */
		register: function(event, fn, scope) {
			if (event && fn) {
				var list = registered[event];
				if (!list) {
					list = [];
					registered[event] = list;
				}
				list.push({ fn: fn, scope: scope });
			}
		}, // register

		/**
		 * Unregsisters a function to listen for an event to be dispatched.
		 * Both parameters must be defined to unregister.
		 * 
		 * @param {String} event a non-null event
		 * @param {Function} fn a non-null function
		 */
		unregister: function(event, fn) {
			if (event && fn) {
				var list = registered[event];
				if (list) {
					var index = list.indexOf(fn);
					if (index >= 0) {
						list.splice(index, 1);
					}
					if (list.length == 0) {
						delete registered[event];
					}
				}
			}
		}, // unregister

		/**
		 * Sends the data to all functions that have been registered for an event.
		 * The event is not dispatched if the event param is not defined.
		 * 
		 * @param {String} event the event to dispatch
		 * @param {Object} data the data, optional
		 */
		send: function(event, data) {
			if (event) {
				//console.log("sending out EVENT", event, data);
				
				var list = registered[event];
				if (list) {
					list.forEach(function(d) {
						if (d.scope) {
							d.fn.apply(d.scope, [data]); // could use d.fn.call(d.scope, data);
						} else {
							d.fn(data);
						}
					})
				}
			}
		} // send
	};
}();
