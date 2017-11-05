module.exports = {
	dev : {
		secret : "ABC",
		dbURL : 'mongodb://localhost/demo',
		moscaURL : 'mongodb://localhost/demo',
		moscaOptions: {},
		dbOptions: {
			useMongoClient: true
			// user: 'sya',
			// pass: "m+qqJ2'ELW7y@Fn"
		}
	},

	// dev: {
	// 	secret: "ABC",
	// 	dbURL: 'mongodb://localhost/demo',
	// 	mqttURL: 'mongodb://localhost/demo',
	// 	dbOptions: {
	// 		useMongoClient: true,
	// 		user: 'sya2',
	// 		pass: 'seeyourairptit'
	// 	}
	// },
	dev2: {
		secret: "ABC",
		dbURL: 'mongodb://localhost/demo?authSource=admin',
		// mqttURL : 'mongodb://203.162.131.246/demo?authSource=admin',
		moscaURL: 'mongodb://%s:%s@localhost/demo?authSource=admin',
		moscaOptions: {
			user: 'sya',
			password: "m+qqJ2'ELW7y@Fn",
			authMechanism: 'DEFAULT'
		},
		dbOptions: {
			useMongoClient: true,
			user: 'sya',
			pass: "m+qqJ2'ELW7y@Fn"
		}
	},
	prod: {
		secret: "ABC",
		dbURL: 'mongodb://root:12345679@ds137281.mlab.com:37281/heroku_jz559sxc'
	}
}
