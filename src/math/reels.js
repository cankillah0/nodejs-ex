/**
 * Created by me on 02.06.2017.
 */
Reels.REELS_COUNT = 6;
Reels.REEL_ICONS_COUNT = 3;
Reels.ICONS_COUNT = 9;
Reels.WILD_ID = 9;
Reels.FREEZE_MAX_VALUE = 50;
Reels.FREEZE_UP_VALUE = 1;
Reels.JOINT_PROBABILITIES = [10, 8, 7, 6, 4];
Reels.JOINT_REEL_COUNT = [2,2,2,2,3,3,3,4,4,5,5,6];
Reels.JOINT_REEL_LENGTH = [11,10,8,6,3];
Reels.REEL_INDEXES = [0,1,2,3,4,5];
Reels.START_BALANCE = 10000;
Reels.LINE_PRICE = 900;
Reels.SPIN_PRICE = 100;

var Lines = require('./lines');
var Util = require('./util');

function Reels(){
    this.prevCombination = null;
    this.frozenReels = null;
    this.frozenCount = null;
    this.freezeValue = Reels.FREEZE_MAX_VALUE;
    this.balance = Reels.START_BALANCE;
}

Reels.prototype.getInitData = function(){
    var combination = this.generateCombination(Reels.WILD_ID - 1);
    var freezable = this.getFreezableReels(combination, Reels.WILD_ID);
    this.saveCombination(combination);
    var data = {
        "combination"   : combination,
        "freezable"     : freezable,
        "freezeValue"   : Reels.FREEZE_MAX_VALUE,
        "balance"       : Reels.START_BALANCE
    };
    return data;
};

Reels.prototype.getSpinData = function(requestData){
    this.parseRequestData(requestData);
    var combination = this.generateCombination(Reels.WILD_ID);
    this.insertFrozenReels(combination);
    var joint = this.getJointIndexes(combination);
    this.saveCombination(combination);
    var lines = Lines.getWinningLines(combination, Reels.WILD_ID);
    var freezable = this.getFreezableReels(combination);
    var dudes = this.getShowDudesValue();
    var bigwin = lines.length > 1;
    this.updateBalance(lines.length);

    var data = {
        "combination"   : combination,
        "lines"         : lines,
        "freezable"     : freezable,
        "joint"         : joint,
        "dudes"         : dudes,
        "freezevalue"   : this.freezeValue,
        "bigwin"        : bigwin,
        "balance"       : this.balance,
        "frozen"        : this.frozenReels
    };
    return data;
};

Reels.prototype.updateBalance = function(linesCount){
    this.balance -= Reels.SPIN_PRICE + this.frozenCount * Reels.SPIN_PRICE;
    if (linesCount){
        this.balance += linesCount * Reels.LINE_PRICE;
    }
};

Reels.prototype.getShowDudesValue = function(){
    /*var pattern = [true, false, false, false, false, true];
    for (var i = 0; i < pattern.length; i++){
        if (pattern[i] != this.frozenReels[i]) return false;
    }
    return true;*/
    return false;
};

Reels.prototype.getJointIndexes = function(combination){
    var probabilities = Reels.JOINT_PROBABILITIES;
    var probability = probabilities[this.frozenCount];

    if (Util.getRandomInt(0, 100) <= probability) {
        var reel = this.getJointReel();
        var jointCounts = Reels.JOINT_REEL_COUNT;
        var jointLength = Reels.JOINT_REEL_LENGTH;
        var maxIndex = jointLength[this.frozenCount];
        var index = Util.getRandomInt(0, maxIndex);
        var count = jointCounts[index];
        var reels = Util.shuffleArray(Reels.REEL_INDEXES.slice());
        var indexes = [];

        for (var i = 0; i < reels.length; i++){
            var index = reels[i];
            //if (!this.frozenReels[index]){
            if (this.frozenReels.indexOf(index) < 0){
                combination[index] = reel;
                indexes.push(index);
                if (indexes.length == count){
                    return indexes;
                }
            }
        }
        return indexes;
    }
    return [];
};

Reels.prototype.getJointReel = function(){
    var reel = [];
    while (reel.length < Reels.REEL_ICONS_COUNT){
        var id = Util.getRandomInt(0, Reels.WILD_ID - 1);
        if (reel.indexOf(id) < 0){
            reel.push(id);
        }
    }
    return reel;
};

Reels.prototype.getFreezableReels = function(combination){
    if (!this.freezeValue) return Reels.REEL_INDEXES;
    var freezable = [];
    for (var i = 0; i < Reels.REELS_COUNT; i++){
        if (combination[i].indexOf(Reels.WILD_ID) < 0){
            freezable.push(i);
        }
    }
    return freezable;
};

Reels.prototype.saveCombination = function(combination){
    this.prevCombination = combination;
};

Reels.prototype.parseRequestData = function(requestData){
    this.frozenReels = requestData.frozen;
    this.frozenCount = this.frozenReels.length;
    /*for (var i = 0; i < this.frozenReels.length; i++){
        if (this.frozenReels[i]) this.frozenCount++;
    }*/
    if (!this.frozenCount){
        this.freezeValue += Reels.FREEZE_UP_VALUE;
        if (this.freezeValue > Reels.FREEZE_MAX_VALUE){
            this.freezeValue = Reels.FREEZE_MAX_VALUE;
        }
    } else {
        this.freezeValue -= this.frozenCount;
    }
};

Reels.prototype.generateCombination = function(max){
    var combination = [];
    for (var i = 0; i < Reels.REELS_COUNT; i++){
        var list = [];
        for (var j = 0; j < Reels.REEL_ICONS_COUNT; j++){
            var id;
            var p = Util.getRandomInt(0, 100);
            if (p < 70){
                id = Util.getRandomInt(0, max);
            } else {
                id = Util.getRandomInt(0, max - 1);
            }
            list.push(id)
        }
        combination.push(list);
    }
    return combination;
};

Reels.prototype.insertFrozenReels = function(combination){
    for (var i = 0; i < combination.length; i++){
        if (this.frozenReels.indexOf(i) > -1){
            combination[i] = this.prevCombination[i];
        }
    }
};

module.exports = Reels;