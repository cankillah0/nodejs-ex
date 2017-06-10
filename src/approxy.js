/**
 * Created by Admin on 18.05.17.
 */
function Approxy(){}

var uuid = require('uuid/v1');
var Reels = require('./math/reels');
var DBProxy = require('./db/dbproxy');

var reelsMap = Object.create(null);
var dbproxy = new DBProxy();

Approxy.prototype.getInitResponse = function(){
    var sessionId = uuid();
    var reels = new Reels();
    var response = reels.getInitData();
        response.sessionId = sessionId;
    reelsMap[sessionId] = reels;

    dbproxy.saveInitData({
        "sessionId" : sessionId,
        "balance"   : response.balance
    });
    return response;
};

Approxy.prototype.getSpinResponse = function(data){
    var reels = reelsMap[data.sessionId];
    var response;
    if (reels){
        response = reels.getSpinData(data);
    } else {
        response = this.getInvalidSessionResponse();
    }
    dbproxy.saveSpinData({
        "sessionId"    : data.sessionId,
        "balance"      : response.balance,
        "combination"  : response.combination,
        "lines"        : response.lines,
        "freezeValue"  : response.freezevalue,
        "joint"        : response.joint,
        "frozen"       : response.frozen });
    return response;
};

Approxy.prototype.getAllData = function(){
    return dbproxy.getAllData();
};

Approxy.prototype.getSessionList = function(){
    return dbproxy.getSessionList();
}


Approxy.prototype.getInvalidSessionResponse = function(){
    return {"error" : "invalid session id"};
};

module.exports = Approxy;