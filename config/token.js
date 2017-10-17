module.exports = {
	// dev : {
	// 	secret : "ABC",
	// 	dbURL : 'mongodb://localhost/demo',
	// 	mqttURL : 'mongodb://localhost/demo',
	// },

	dev: {
		secret: "ABC",
		dbURL: 'mongodb://localhost/demo',
		mqttURL: 'mongodb://localhost/demo',
		dbOptions: {
			useMongoClient: true,
			user: 'sya2',
			pass: 'seeyourairptit'
		}
	},
	dev2: {
		secret: "ABC",
		dbURL: 'mongodb://203.162.131.246/demo?authSource=admin',
		// mqttURL : 'mongodb://203.162.131.246/demo?authSource=admin',
		moscaURL: 'mongodb://%s:%s@203.162.131.246/demo?authSource=admin',
		moscaOptions: {
			user: 'sya2',
			password: 'seeyourairptit',
			authMechanism: 'DEFAULT'
		},
		dbOptions: {
			useMongoClient: true,
			user: 'sya2',
			pass: 'seeyourairptit'
		}
	},
	prod: {
		secret: "ABC",
		dbURL: 'mongodb://root:12345679@ds137281.mlab.com:37281/heroku_jz559sxc'
	}
}