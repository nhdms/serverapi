module.exports = {
	dev : {
		secret : "ABC",
		dbURL : 'mongodb://sya2:seeyourairptit@127.0.0.1/demo?authSource=admin',
		mqttURL : 'mongodb://sya2:seeyourairptit@127.0.0.1/mqtt?authSource=admin',
	},
	prod : {
		secret : "ABC",
		dbURL : 'mongodb://root:12345679@ds137281.mlab.com:37281/heroku_jz559sxc'
	}
}