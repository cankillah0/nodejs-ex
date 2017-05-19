/**
 * Created by Admin on 18.05.17.
 */
function Approxy(){}

Approxy.prototype.getResponse = function(){
    var combination = [];
    for (var i = 0; i < 6; i++){
        var list = [];
        for (var j = 0; j < 3; j++){
            list.push(getRandomInt(0, 9))
        }
        combination.push(list);
    }
    var data = {"combination" : combination};
    var dataJson = JSON.stringify(data);
    return dataJson;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

Approxy.prototype.signAllowHeaders = function(response){
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
    response.setHeader('Access-Control-Allow-Credentials', true);
};

module.exports = Approxy;