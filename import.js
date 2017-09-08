var mongoose = require('mongoose');
const request = require('request');
const cheerio = require('cheerio');
var parser = require('ua-parser-js');
mongoose.connect('mongodb://localhost/ua');

// console.log(process.argv);
var indexa = process.argv[2];
var indexb = process.argv[3];

var kittySchema = mongoose.Schema({
}, { strict: false });

var Kitten = mongoose.model('Kitten', kittySchema);
var ua = parser('Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1');

var name = ['chrome', 'internet-explorer', 'firefox', 'android-browser', 'opera-mini', 'uc-browser', 'safari', 'opera', 'facebook-app'];
var len = [1137, 1042, 203, 289, 237, 128, 96, 123, 34];
var j = 9;
var d = 0;
var childRecursion = function (t, z, browser, cb) {
    if (t < z) {
        request('https://developers.whatismybrowser.com/useragents/explore/software_name/' + browser + '/' + t, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                //   console.log(html)
                var $ = cheerio.load(html);
                $('tbody > tr').each(function (ii, element) {
                    try {
                        var a = $('td', this);
                        var uaString = $(a[0]).text(),
                            ua = parser(uaString);
                        ua = JSON.parse(JSON.stringify(ua));

                        if (!!ua.device) ua.device.type = $(a[3]).text();
                        delete ua.engine;
                        var x = new Kitten(ua);
                        x.save((ex) => {
                            if (ex) console.error(ex);
                            else console.log(`page ${t} in ${browser}, total ${d++}, last: ${name.indexOf(browser)}`);
                        });
                    } catch (e) { }
                });
                t++;
                childRecursion(t, z, browser, cb);
            } else {
                t++;
                childRecursion(t, z, browser, cb);
            }
        });
    } else {
        cb();
    }
}

var recursion = function (i) {
    if (i < j) {
        console.log(i, j);
        var browser = name[i];
        var ll = len[i];
        var st = !!(+indexb) ? +indexb : 0;

        childRecursion(st, ll, browser, () => {
            i++;
            recursion(i);
        })
    } else {
        console.log('DONEEEEE!');
    }
}

var sf = !!(+indexa) ? +indexa : 0;
recursion(sf);
