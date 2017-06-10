/**
 * Created by me on 04.06.2017.
 */
function DBProxy(){

}
var async = require('async');

var Promise = require("es6-promise").Promise

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/test1');
var db = mongoose.connection;

db.on('error', function (err) {
    console.error('connection error:', err.message);
});
db.once('open', function callback () {
    console.info("Connected to DB!");
});

var Schema = mongoose.Schema;
var spinType = "spin";
var initType = "init";

var spinSchema = new Schema({
    sessionId:   { type: String, required: true},
    balance:     { type: Number, required: true},
    date:        { type: Date,   required: true},
    type:        { type: String, required: true},
    combination: { type: Array,  required: false},
    lines:       { type: Number, required: false},
    freezeValue: { type: Number, required: false},
    joint:       { type: Array,  required: false},
    frozen:      { type: Array,  required: false}
});

var spinModel = mongoose.model('spin', spinSchema);

DBProxy.prototype.saveSpinData = function(data){
    var spin = new spinModel({
        sessionId    : data.sessionId,
        balance      : data.balance,
        date         : new Date(),
        type         : spinType,
        combination  : data.combination,
        lines        : data.lines.length,
        freezeValue  : data.freezeValue,
        joint        : data.joint,
        frozen       : data.frozen
    });

    spin.save(function(error){
        if (!error){
            console.log("spin saved");
        } else {
            console.error("error : " + error.name);
        }
    });
};

DBProxy.prototype.saveInitData = function(data){
    var init = new spinModel({
        sessionId    : data.sessionId,
        balance      : data.balance,
        date         : new Date(),
        type         : initType
    });

    init.save(function(error){
        if (!error){
            console.log("spin saved");
        } else {
            console.error("error : " + error.name);
        }
    });
};

DBProxy.prototype.getAllData = function(){
    //spinModel.remove({}).exec();
    return spinModel.find().lean().exec(function (error, spins) {
        if (!error) {
            return spins;
        } else {
            return { error: 'Server error' };
        }
    });
};

DBProxy.prototype.getSessionList = function(){
    return new Promise(function(resolve, reject){
        spinModel.find({type: "init"}).sort({date : -1}).lean().exec(function (error, inits) {
            if (!error) {
                DBProxy.prototype.getSessionDateBalance(inits).then(
                    function(data){
                        resolve(data);
                    });
            } else {
                return { error: 'Server error' };
            }
        });
    });
};

DBProxy.prototype.getSessionDateBalance = function(initList){
    return new Promise(function(resolve, reject){
        var additional = [];
        async.forEach(initList, function (item, callback){
            spinModel.findOne({ type : "spin", sessionId : item.sessionId})
                .sort({date : -1})
                .lean()
                .exec(function (error, spin){
                    additional.push(spin);
                    callback();
                });
        }, function (error)
        {
            for (var i = 0; i < initList.length; i++)
            {
                for (var j = 0; j < additional.length; j++)
                {
                    if (additional[j] != null && additional[j].sessionId == initList[i].sessionId)
                    {
                        initList[i].curBalance = additional[j].balance;
                        initList[i].lastDate   = additional[j].date;
                        break;
                    }
                }
                if (initList[i].lastDate == null){
                    initList[i].lastDate   = initList[i].date;
                    initList[i].curBalance = initList[i].balance;
                }
            }

            DBProxy.prototype.getSessionSpinsCount(initList).then(function(){
               resolve(initList);
            });
        });
    });
};

DBProxy.prototype.getSessionSpinsCount = function(initList){
    return new Promise(function(resolve, reject){
        async.forEach(initList, function (item, callback){
            spinModel.count({ type : "spin", sessionId : item.sessionId})
                .lean()
                .exec(function (error, count){
                    item.spinsCount = count;
                    callback();
                });
        }, function (error){
            resolve(initList);
        });
    });
};

module.exports = DBProxy;