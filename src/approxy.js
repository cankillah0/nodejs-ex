/**
 * Created by Admin on 18.05.17.
 */
function Approxy(){}

Approxy.REELS_COUNT = 6;
Approxy.REEL_ICONS_COUNT = 3;
Approxy.ICONS_COUNT = 9;
Approxy.WILD_ID = 9;

var Lines = require('./lines');

Approxy.prototype.getInitResponse = function(requestData){
    var combination = this.generateCombination(Approxy.WILD_ID - 1);
    var freezable = this.getFreezableReels(combination, Approxy.WILD_ID);
    var data = {
        "combination" : combination,
        "freezable"   : freezable
    };
    var dataJson = JSON.stringify(data);
    return dataJson;
};

Approxy.prototype.getSpinResponse = function(requestData){
    this.parseRequestData(requestData);

    var combination = this.generateCombination(Approxy.WILD_ID);
    this.insertFrozenReels(combination);

    var joint = this.getJointIndexes(combination);
    this.saveCombination(combination);

    var lines = Lines.getWinningLines(combination, Approxy.WILD_ID);

    var freezable = this.getFreezableReels(combination);

    var data = {
        "combination" : combination,
        "lines"       : lines,
        "freezable"   : freezable,
        "joint"       : joint
    };
    var dataJson = JSON.stringify(data);
    return dataJson;
};

Approxy.prototype.getJointIndexes = function(combination){
    var probabilities = [50, 40, 30, 20, 10];
    var probability = probabilities[this.frozenCount];

    if (this.getRandomInt(0, 100) <= probability){
        var reel = null;
        for (var i = 0; i < combination.length; i++){
            if (!this.frozenReels[i] && combination[i].indexOf(Approxy.WILD_ID) < 0){
                reel = combination[i];
                break;
            }
        }
        if (!reel) return [];
        var count = this.getRandomInt(2, 6 - this.frozenCount);
        var reels = this.shuffleArray([0,1,2,3,4,5]);
        var indexes = [];
        for (var i = 0; i < reels.length; i++){
            var index = reels[i];
            if (!this.frozenReels[index]){
                combination[index] = reel;
                indexes.push(index);
                if (indexes.length == count){
                    break;
                }
            }
        }
        return indexes;
    }
    return [];
};


Approxy.prototype.getFreezableReels = function(combination){
    var freezable = [true,true,true,true,true,true];
    for (var i = 0; i < Approxy.REELS_COUNT; i++){
        if (combination[i].indexOf(Approxy.WILD_ID) >= 0){
            freezable[i] = false;
        }
    }
    return freezable;
};

Approxy.prototype.saveCombination = function(combination){
    this.prevCombination = combination;
};

Approxy.prototype.parseRequestData = function(requestData){
    this.frozenReels = requestData.frozen;
    this.frozenCount = 0;
    for (var i = 0; i < this.frozenReels.length; i++){
        if (this.frozenReels[i]) this.frozenCount++;
    }
};

Approxy.prototype.generateCombination = function(max){
    var combination = [];
    for (var i = 0; i < Approxy.REELS_COUNT; i++){
        var list = [];
        for (var j = 0; j < Approxy.REEL_ICONS_COUNT; j++){
            list.push(this.getRandomInt(0, max))
        }
        combination.push(list);
    }
    return combination;
};

Approxy.prototype.insertFrozenReels = function(combination){
    if (!this.prevCombination) return combination;
    for (var i = 0; i < combination.length; i++){
        if (this.frozenReels[i]){
            combination[i] = this.prevCombination[i];
        }
    }
};

Approxy.prototype.getRandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Approxy.prototype.shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

module.exports = Approxy;