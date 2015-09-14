define([
	'matreshka_dir/core/var/core',
	'matreshka_dir/core/initmk'
], function(core, initMK) {
	var mediate = core.mediate = function(object, keys, mediator) {
		if (!object || typeof object != 'object') return object;

		initMK(object);

		var type = typeof keys,
			i,
			special;

		if (type == 'object' && !(keys instanceof Array)) {
			for (i in keys) {
				if (keys.hasOwnProperty(i)) {
					core.mediate(object, i, keys[i]);
				}
			}
			return object;
		}

		keys = type == 'string' ? keys.split(/\s/) : keys;

		for (i = 0; i < keys.length; i++)(function(key) {
			special = core._defineSpecial(object, key);

			special.mediator = function(v) {
				return mediator.call(object, v, special.value, key, object);
			};

			core.set(object, key, special.mediator(special.value), {
				fromMediator: true
			});
		})(keys[i]);

		return object;
	};

	var setClassFor = core.setClassFor = function(object, keys, Class, updateFunction) {
		if (!object || typeof object != 'object') return object;

		initMK(object);

		var type = typeof keys,
			i;

		if (type == 'object' && !(keys instanceof Array)) {
			for (i in keys)
				if (keys.hasOwnProperty(i)) {
					core.setClassFor(object, i, keys[i], Class);
				}

			return object;
		}

		keys = type == 'string' ? keys.split(/\s/) : keys;

		updateFunction = updateFunction || function(instance, data) {
			var i;

			if (instance.isMKArray) {
				instance.recreate(data);
			} else if (instance.isMKObject) {
				instance.jset(data);
			} else {
				for (i in data) {
					if (data.hasOwnProperty(i)) {
						instance[i] = data[i];
					}
				}
			}
		};

		for (i = 0; i < keys.length; i++) {
			core.mediate(object, keys[i], function(v, previousValue) {
				var result;
				if (previousValue instanceof Class) {
					updateFunction.call(object, previousValue, v);
					result = previousValue;
				} else {
					result = new Class(v);
				}

				return result;
			});
		}

		return object;
	};
});