var express = require('express');
var router = express.Router();
var API = require("../bin/aerohive/api/main");
/* GET users listing. */
router.post('/identity/userGroup', function (req, res, next) {
    if (req.session.xapi) {
        API.identity.userGroups.getUserGroups(req.session.xapi, null, null, function (err, result) {
            if (err) res.json({ error: err });
            else {
                result.reqId = req.body.reqId;
                res.json(result);
            }
        });
    } else res.status(403).send('Unknown session');
});
router.get('/identity/credentials', function (req, res, next) {
    if (req.session.xapi) {
        var credentialType = [""];
        var userGroup = [""];
        var credentials = [];

        if (req.query.credentialType) {
            if (typeof req.query.credentialType === "string") credentialType = [req.query.credentialType];
            else credentialType = req.query.credentialType;
        }
        if (req.query.userGroup) {
            if (typeof req.query.userGroup === "string") userGroup = [req.query.userGroup];
            else userGroup = req.query.userGroup;
        }

        var reqDone = 0;
        var reqMax = credentialType.length * userGroup.length;
        credentialType.forEach(function (credential) {
            userGroup.forEach(function (group) {
                API.identity.credentials.getCredentials(req.session.xapi, credential, group, null, null, null, null, null, null, null, null, null, null, function (err, result) {
                    if (err) res.json({ error: err });
                    else {
                        result.forEach(function (account) {
                            credentials.push(account);
                        });
                        reqDone++;
                    }
                    if (reqDone == reqMax) {
                        res.json(credentials);

                    }
                });

            })
        });
    } else res.status(403).send('Unknown session');
});
router.post('/identity/credentials', function (req, res, next) {
    if (req.session.xapi) {
        var hmCredentialsRequestVo = {};
        if (req.body.hmCredentialsRequestVo) hmCredentialsRequestVo = req.body.hmCredentialsRequestVo;
        API.identity.credentials.createCredential(req.session.xapi, null, null, hmCredentialsRequestVo, function (err, result) {
            if (err) res.json({ error: err });
            else res.json(result);
        })
    } else res.status(403).send('Unknown session');
});
router.delete('/identity/credentials', function (req, res, next) {
    if (req.session.xapi) {
        var ids = "";
        if (req.query.ids) ids = req.query.ids;
        API.identity.credentials.deleteCredential(req.session.xapi, null, null, ids, function (err, result) {
            if (err) res.json({ error: err });
            else res.json(result);
        })
    } else res.status(403).send('Unknown session');
});
router.put('/identity/credentials/renew', function (req, res, next) {
    if (req.session.xapi) {
        var id = "";
        if (req.query.id) id = req.query.id;
        API.identity.credentials.renewCredential(req.session.xapi, id, null, null, function (err, result) {
            if (err) res.json({ error: err });
            else res.json(result);
        })
    } else res.status(403).send('Unknown session');
});
router.post('/identity/credentials/deliver', function (req, res, next) {
    if (req.session.xapi) {
        if (req.body.hmCredentialDeliveryInfoVo) {
            var hmCredentialDeliveryInfoVo = req.body.hmCredentialDeliveryInfoVo;
            if (req.query.id) id = req.query.id;
            API.identity.credentials.deliverCredential(req.session.xapi, null, null, hmCredentialDeliveryInfoVo, function (err, result) {
                if (err) res.json({ error: err });
                else res.json(result);
            })
        }
    } else res.status(403).send('Unknown session');
});
router.get('/monitor/devices', function (req, res, next) {
    if (req.session.xapi) {
        var credentialType = [""];
        var userGroup = [""];
        var credentials = [];

        if (req.query.credentialType) {
            if (typeof req.query.credentialType === "string") credentialType = [req.query.credentialType];
            else credentialType = req.query.credentialType;
        }
        if (req.query.userGroup) {
            if (typeof req.query.userGroup === "string") userGroup = [req.query.userGroup];
            else userGroup = req.query.userGroup;
        }

        var reqDone = 0;
        var reqMax = credentialType.length * userGroup.length;
        credentialType.forEach(function (credential) {
            userGroup.forEach(function (group) {
                API.identity.credentials.getCredentials(req.session.xapi, credential, group, null, null, null, null, null, null, null, null, null, null, function (err, result) {
                    if (err) res.json({ error: err });
                    else {
                        result.forEach(function (account) {
                            credentials.push(account);
                        });
                        reqDone++;
                    }
                    if (reqDone == reqMax) {
                        API.monitor.client.clientsList(req.session.xapi, function (err, clients) {
                            if (err) res.json({ error: err });
                            else {
                                credentials.forEach(function (credential) {
                                    credential.clients = [];
                                    clients.forEach(function (client) {
                                        if (client.userName == credential.userName) credential.clients.push(client);
                                    })
                                });
                                res.json(credentials);
                            }
                        });
                    }
                })
            });
        });
    } else res.status(403).send('Unknown session');
});

router.get('/identity/status', function (req, res, next) {
    if (req.session.xapi) {
        var clientStatus = {
            connected: false,
            os: "N/A",
            ssid: "N/A",
            radioHealth: "N/A",
            networkHealth: "N/A",
            applicationHealth: "N/A",
            hostName: "N/A",
            ip: "N/A",
            userProfile: "N/A",
            clientMac: "N/A",
            radioBand: "N/A",
            clientProtocol: "N/A"
        };
        var userName = "";
        var client = undefined;
        if (req.query.userName) {
            userName = req.query.userName;
            API.monitor.client.clientsList(req.session.xapi, function (err, clients) {
                if (err) res.json(err);
                else {
                    clients.forEach(function (client) {
                        if (client.userName === userName) {
                            clientStatus = {
                                connected: true,
                                os: client.os,
                                ssid: client.ssid,
                                radioHealth: client.radioHealth,
                                networkHealth: client.networkHealth,
                                applicationHealth: client.applicationHealth,
                                hostName: client.hostName,
                                ip: client.ip,
                                userProfile: client.userProfile,
                                clientMac: client.clientMac
                            };
                        }
                    });
                    if (client != undefined)
                        API.monitor.client.clientDetails(req.session.xapi, client.clientId, function (err, clientDetails) {
                            if (err) res.json({ data: clientStatus });
                            clientStatus.radioBand = clientDetails.radioBand;
                            clientStatus.clientProtocol = clientDetails.clientProtocol;
                            res.json({ data: clientStatus });
                        });
                    else res.json({ data: clientStatus });
                }
            });
        } else res.json({});
    } else res.status(403).send('Unknown session');
});
module.exports = router;
