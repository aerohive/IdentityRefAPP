var express = require('express');
var router = express.Router();
var ApiConf = require(appRoot + "/bin/aerohive/config");

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/', function (req, res, next) {
    if (req.session.hasOwnProperty("xapi")) res.redirect("/web-app/");
    else {
        var errorcode;
        if (req.query.hasOwnProperty('errorcode')) errorcode = req.query["errorcode"];
        res.render('login', {
            title: 'Identity',
            errorcode: errorcode,
            client_id: ApiConf.clientId,
            redirect_uri: ApiConf.redirectUrl
        });
    }
});
router.post('/', function (req, res, next) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    var accessTokenRegexp = new RegExp("^[^ ]{40}$");
    var apiServers = ["cloud-va.aerohive.com", "cloud-ie.aerohive.com"];
    if (!(req.body.hasOwnProperty("vpcUrl") && apiServers.indexOf(req.body["vpcUrl"]) >= 0)) {
        res.redirect("/?errorcode=1");
    } else if (!(req.body.hasOwnProperty("ownerID") && ownerIdRegexp.test(req.body['ownerID']))) {
        res.redirect("/?errorcode=2");
    } else if (!(req.body.hasOwnProperty("accessToken") && accessTokenRegexp.test(req.body["accessToken"].trim()))) {
        res.redirect("/?errorcode=3");
    } else {
        req.session.xapi = {
            rejectUnauthorized: true,
            vpcUrl: req.body["vpcUrl"],
            ownerId: req.body["ownerID"],
            accessToken: req.body["accessToken"].trim()
        };
        res.redirect('/web-app/');
    }
});
router.post('/op', function (req, res, next) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    var accessTokenRegexp = new RegExp("^[a-zA-Z0-9]{40}$");
    var apiServers = ["cloud-va.aerohive.com", "cloud-ie.aerohive.com"];
    if (!(req.body.hasOwnProperty("vpcUrl") && req.body["vpcUrl"] != "")) res.redirect("/?errorcode=1");
    else if (!(req.body.hasOwnProperty("ownerID") && ownerIdRegexp.test(req.body['ownerID']))) res.redirect("/?errorcode=2");
    else if (!(req.body.hasOwnProperty("accessToken") && accessTokenRegexp.test(req.body["accessToken"].trim()))) res.redirect("/?errorcode=3");
    else if (apiServers.indexOf(req.body["vpcUrl"]) >= 0) res.redirect('/?errorcode=4');
    else {
        req.session.xapi = {
            rejectUnauthorized: false,
            vpcUrl: req.body["vpcUrl"],
            ownerId: req.body["ownerID"],
            accessToken: req.body["accessToken"].trim()
        };
        res.redirect('/web-app/');
    }
});
router.get('/howto/', function (req, res, next) {
    res.render('howto', {title: 'Identity'});
});
router.get('/logout/', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) logger.error(err);
        else res.redirect('/');
    });
});
module.exports = router;
