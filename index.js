
module.exports = function sqlString(){
    var self = this;

    this.$init = function(){
        self._bolSqlPaging = false;
        self._sqlPageSize = 10;
        self._sqlOffset = 0;
        self._strHaving = "";
        self._strGroupBy = "";
        self._strGroupCount = "";
        self._strGroupSumField = "";
        self._strGroupSumValue = "";
        self._strOrderBy = "";
        self._strLimit = "";
        self._strFrom = "";
        self._strOffset = "";
        self._bolRadius = false;
        self._strRadiusLatField = "";
        self._strRadiusLatValue = "";
        self._strRadiusLngField = "";
        self._strRadiusLngValue = "";
        self._bolSqlCount = false;
        self._bolSqlPagingCount = false;
        self.clearFields();
    };

    this.$terminate = function(){};

    this.clearFields = function(){
        self._aryValues = [];
        self._aryValuesInt = [];
        self._aryJoin = [];
        self._strHaving = "";
        self._strGroupBy = "";
        self._strGroupCount = "";
        self._strGroupSumField = "";
        self._strGroupSumValue = "";
        self._groupTypes = [];
        self._strOrderBy = "";
        self._strLimit = "";
        self._strFrom = "";
        self._strOffset = "";
        self._bolRadius = false;
        self._strRadiusLatField = "";
        self._strRadiusLatValue = "";
        self._strRadiusLngField = "";
        self._strRadiusLngValue = "";
    };

    //COMMON FUNCTIONS
    this.clean = function(str){
        str += "";
        str = str.replace(/\'/ig,"''");
        while(str.indexOf("\\\\")>-1){
            str = str.replace(/\\\\/ig,"\\");
        }
        return str;
    };

    this.join = function(typ,t,w,a){
        var newAry, tableFound, cnt;
        tableFound = false;
        cnt = self._aryJoin.length;
        for(var i=0; i<cnt; i++){
            if(self._aryJoin[i][0]==t && self._aryJoin[i][3]==a){
                tableFound = true;
                self._aryJoin[i][1] = w;
                self._aryJoin[i][2] = typ;
                self._aryJoin[i][3] = a;
            }
        }
        if(tableFound==false){
            newAry = [t+'',w+'',typ+'',a+''];
            self._aryJoin.push(newAry);
        }
    };

    this.field = function(n,v){
        var nameFound;
        if(v===undefined) v = '';
        nameFound = false;
        var lngValues = self._aryValues.length;
        for(var i=0; i<lngValues; i++){
            var value = self._aryValues[i];
            if(value[0]==n){
                nameFound = true;
                value[1] = v;
                break;
            }
        }
        if(nameFound==false) self._aryValues.push([n,v]);
    };

    this.orderBy = function(n){
        self._strOrderBy = n;
    };

    this.groupBy = function(n){
        self._strGroupBy = n;
    };

    this.groupType = function(typ,n,v){
        self._groupTypes.push({typ:typ,n:n,v:v});
    };

    this.having = function(str){
        self._strHaving = str;
    };

    this.fromClause = function(str){
        self._strFrom = str;
    };

    this.limit = function(limit,offset){
        if(!offset) offset = 0;
        self._strLimit = limit;
        self._strOffset = offset;
    };

    this.select = function(t,w){
        var cnt, strSQL;
        if(!w) w = "";
        strSQL = "SELECT ";

        if(self._bolSqlPaging==true && self._bolSqlPagingCount==true) strSQL += "SQL_CALC_FOUND_ROWS ";
        cnt =  self._aryValues.length;
        if(cnt==0){
            strSQL += "*";
        }else{
            for(var i=0; i<cnt; i++){
                (i==(cnt-1)) ? strSQL += self._aryValues[i][0] + " " : strSQL += self._aryValues[i][0] + ", ";
            }
        }
        if(self._strGroupCount!="") strSQL += ", Count(*) as " + self._strGroupCount;
        if(self._strGroupSumField!="" && self._strGroupSumValue!="") strSQL += ", SUM(" + self._strGroupSumField + ") as " + self._strGroupSumValue;

        if(self._groupTypes.length>0){
            cnt = self._groupTypes.length;
            for(var i=0; i<cnt; i++){
                var n = self._groupTypes[i];
                strSQL += ", " + n.typ + "(" + n.n + ") as " + n.v;
            }
        }
        if(self._bolRadius==true) strSQL += ", ATAN2(SQRT(POW(COS(RADIANS(" + self._strRadiusLatValue + ")) * SIN(RADIANS(" + self._strRadiusLngField + " - " + self._strRadiusLngValue + ")), 2) + POW(COS(RADIANS(" + self._strRadiusLatField + ")) * SIN(RADIANS(" + self._strRadiusLatValue + ")) - SIN(RADIANS(" + self._strRadiusLatField + ")) * COS(RADIANS(" + self._strRadiusLatValue + ")) * COS(RADIANS(" + self._strRadiusLngField + " - " + self._strRadiusLngValue + ")), 2)), (SIN(RADIANS(" + self._strRadiusLatField + ")) * SIN(RADIANS(" + self._strRadiusLatValue + ")) + COS(RADIANS(" + self._strRadiusLatField + ")) * COS(RADIANS(" + self._strRadiusLatValue + ")) * COS(RADIANS(" + self._strRadiusLngField + " - " + self._strRadiusLngValue + "))) ) * 3438.461 AS distance"
        strSQL += " FROM " + t;

        cnt = self._aryJoin.length;
        if(cnt>0){
            for(var i=0; i<cnt; i++){
                if(self._aryJoin[i][2]!="") strSQL += " " + self._aryJoin[i][2];
                strSQL += " JOIN " + self._aryJoin[i][0];
                if(typeof self._aryJoin[i][3] !== 'undefined' && self._aryJoin[i][3]!=='') strSQL += " "+ self._aryJoin[i][3];
                strSQL += " on " + self._aryJoin[i][1];
            }
        }
        if(w!="") strSQL += " WHERE " + w;
        if(self._strGroupBy!="") strSQL += " GROUP BY " + self._strGroupBy;
        if(self._strHaving!="") strSQL += " HAVING " + self._strHaving;
        if(self._strOrderBy!="") strSQL += " ORDER BY " + self._strOrderBy;
        if(self._strLimit!="" && self._bolSqlPaging==false) strSQL += " LIMIT " + self._strLimit + " OFFSET " + self._strOffset;
        if(self._bolSqlPaging==true) strSQL += " LIMIT " + self._sqlOffset + "," + self._sqlPageSize;
        return strSQL+";";
    };


    this.insert = function(t){
        var strNames, strValues, strSQL;
        strNames = "";
        strValues = "";
        var cnt = self._aryValues.length;
        for(var i=0; i<cnt; i++){
            var value = "'" + self.clean(self._aryValues[i][1]) + "'";
            if(self._aryValues[i][1]===null) value = null;
            if(i==(cnt-1)){
                strNames += self._aryValues[i][0] + " ";
                strValues += value;
            }else{
                strNames += self._aryValues[i][0] + ", ";
                strValues += value + ",";
            }
        }
        strSQL = "INSERT INTO " + t + " (" + strNames + ") Values ( " + strValues + " );";
        return strSQL;
    };

    this.update = function(t,w){
        var strSQL, strValues, cnt;
        strValues = "";
        if(!w) w="";
        if(self._aryValues.length>0){
            cnt = self._aryValues.length;
            for(var i=0; i<cnt; i++){
                var value = "'" + self.clean(self._aryValues[i][1]) + "'";
                if(self._aryValues[i][1]===null) value = null;
                if(strValues==""){
                    strValues += " " + self._aryValues[i][0] + "=" + value;
                }else{
                    strValues += ", " + self._aryValues[i][0] + "=" + value;
                }
            }
        }
        if(self._aryValuesInt.length>0){
            cnt = self._aryValuesInt.length;
            for(var i=0; i<cnt; i++){
                if(strValues==""){
                    strValues += " " + self._aryValuesInt[i][0] + "=" + self._aryValuesInt[i][0] +""+ self._aryValuesInt[i][1] +""+ aself._aryValuesInt[i][2];
                }else{
                    strValues += ", " + self._aryValuesInt[i][0] + "=" + self._aryValuesInt[i][0] +""+ self._aryValuesInt[i][1] +""+ self._aryValuesInt[i][2] + "";
                }
            }
        }
        strSQL = "UPDATE " + t + " Set" + strValues;
        if(self._strFrom!=='') strSQL += " FROM " + self._strFrom + "";
        strSQL += " WHERE " + w + ";";
        return strSQL;
    };

    this.delete = function(t,w){
        var strSQL;
        if(!w) w="";
        strSQL = "Delete FROM " + t;
        strSQL = strSQL + " WHERE " + w;
        strSQL = strSQL + ";";
        return strSQL;
    };

    //INITALIZE CLASS
    this.$init();
    return this;
};
