var checkbox = null;
var checkboxArray = null;
var navigationQuery = "{\"size\":0,\"aggs\":{\"museum\":{\"terms\":{\"field\":\"museumsid\",\"order\":{\"_term\":\"asc\"},\"size\":1000},\"aggs\":{\"fag\":{\"terms\":{\"field\":\"fagmiljøer\",\"order\":{\"_term\":\"asc\"},\"size\":1000}}}}}}";
var defaultObj = null;
var runQuery = null;
var spaceSplitter = new RegExp("([\\s]+)", "g");
var pagePos = 0;
var pageSize = 12;
var resultElastic;
var randomNumber = 0;
var wheelInstance = null;
var rowsInResult = 0;
var columnsInResult = 0;
var museumArray = null;
var firstTime = false;
var collections = [
    {
        "field": "uio.bio",
        "display": "Biovitenskapelige samlinger"
    },
    {
        "field": "uio.g.med",
        "display": "Medisinhistorisk samling"
    },
    {
        "field": "uio.kje",
        "display": "Kjemiske samlinger"
    },
    {
        "field": "uio.obs",
        "display": "Observatoriesamlingen"
    },
    {
        "field": "uio.fys",
        "display": "Fysikksamlingen"
    },
    {
        "field": "uio.far",
        "display": "Farmasisamlingen"
    }
];
String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};
function qCollectionDisplay(museum) {
    for (var temp = 0; temp < collections.length; temp++)
        if (museum == collections[temp].field)
            return (collections[temp].display);
    return museum;
}
function continueInitialize() {
    wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
    document.getElementById('inputField').value = "";
    var d = JSON.parse("{\"must\":[]}");
    defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    defaultObj.size = pageSize;
    var formData = {};
    formData.elasticdata = navigationQuery;
    formData.elasticdata = JSON.stringify(aggObject, null, 2);
    formData.resturl = Tools.elSearchPath();
    postPhpMain(formData, insertNavigationLinks);
    resize();
}
function mainInitialize() {
    $(document).ready(function () {
        // do jQuery
    });
    var formData = new Object();
    formData.resturl = Tools.elSearchPath() + "?q=hasPhoto:1";
    formData.elasticdata = new Object();
    formData.elasticdata.size = 0;
    formData.elasticdata = JSON.stringify(formData.elasticdata, null, 2);
    postPhpMain(formData, findRandomNumber);
}
function findRandomNumber(data) {
    var el = new ElasticClass(data);
    randomNumber = Math.floor((Math.random() * (el.getDocCount() - pageSize) + 1));
    continueInitialize();
}
//q=hasPhoto=1
//test kommntar
function insertKeyword() {
    //    (<HTMLInputElement> document.getElementById('inputField')).value = (<HTMLInputElement> document.getElementById('inputField')).value + " " + (<HTMLSelectElement> document.getElementById('keywordList')).value.trim();
    search();
}
function insertNavigationLinks(data) {
    var es = new ElasticClass(data);
    checkboxArray = new Array();
    var table = document.getElementById('navigationTable');
    museumArray = data.aggregations.museum.buckets;
    for (var temp = 0; temp < museumArray.length; temp++)
        museumArray[temp].showSubject = false;
    displayNavigationList();
    var keywordSelect = document.getElementById('keywordList');
    var arr = es.getFacetFieldWithFacetName("keywords");
    Tools.addOption(keywordSelect, "Velg", "");
    for (var temp_1 = 0; temp_1 < arr.length; temp_1++) {
        if (arr[temp_1].key != "")
            Tools.addOption(keywordSelect, arr[temp_1].key, arr[temp_1].key);
    }
    setToZero();
}
function displayNavigationList() {
    document.getElementById('navigationTable').innerHTML = "";
    var table = document.getElementById('navigationTable');
    insertContentIntoRelationTable(table, "<br>");
    for (var temp = 0; temp < museumArray.length; temp++) {
        var collection = museumArray[temp].key.trim();
        if (collection == "")
            continue;
        collection = qCollectionDisplay(collection);
        if (museumArray[temp].showSubject == true)
            insertContentIntoRelationTable(table, "<a href='javascript:switchMuseum(" + temp + ")' style='color:#0000ff;text-decoration:none;'>" + collection + " (" + museumArray[temp].doc_count + ")&nbsp;<span style='font-size: 1.4em;'>-</span></a>");
        else
            insertContentIntoRelationTable(table, "<a href='javascript:switchMuseum(" + temp + ")' style='color:#0000ff;text-decoration:none;'>" + collection + " (" + museumArray[temp].doc_count + ")&nbsp;<span style='font-size: 1.4em;'>+</span></a>");
        if (museumArray[temp].showSubject == true) {
            var fag = museumArray[temp].fag;
            for (var i = 0; i < fag.buckets.length; i++) {
                var key = fag.buckets[i].key;
                var cnt = fag.buckets[i].doc_count;
                //         insertContentIntoRelationTable(table,key+ " ("+ cnt +")");
                createCheckBox(table, key, cnt, museumArray[temp].key.trim());
            }
        }
        insertContentIntoRelationTable(table, "<br>");
    }
}
function switchMuseum(index) {
    randomNumber = pagePos;
    for (var temp = 0; temp < checkboxArray.length; temp++)
        if (checkboxArray[temp].checked == true)
            randomNumber = 0;
    museumArray[index].showSubject = museumArray[index].showSubject == true ? false : true;
    setToZero();
    displayNavigationList();
}
function createCheckBox(table, key, cnt, collection) {
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = "ch" + checkboxArray.length;
    checkbox.id = "ch" + checkboxArray.length;
    var i = checkboxArray.length;
    checkbox.onclick = function () { onClickCheckbox(i); };
    checkbox.topic = key;
    checkbox.collection = collection;
    checkboxArray.push(checkbox);
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.appendChild(checkbox);
    var label = document.createElement('SPAN');
    label.innerHTML = key;
    cell1.appendChild(label);
}
/*
function seeIfLookUp(event) {
    if (event.keyCode == 13) {
        if (document.activeElement === document.getElementById("inputField"))
            search();
        return;
    }
}
*/
function onClickCheckbox(i) {
    search();
}
function insertWordSearch(query) {
    var ob;
    var b = document.getElementById('inputField').value.trim();
    if (b.length == 0)
        return;
    var arr = b.split(".");
    if (arr.length > 2) {
        var f = new Object();
        ob = new Object();
        f.museumKey = b;
        ob.match = f;
        query.query.bool.must.push(ob);
        return;
    }
    var qu;
    qu = b.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    for (var temp = 0; temp < words.length; temp++) {
        var pos = void 0;
        var f = new Object();
        ob = new Object();
        if (words[temp].indexOf("*") != -1 || words[temp].indexOf("?") != -1) {
            f.textcontainer = words[temp];
            ob.wildcard = f;
        }
        else {
            f.textcontainer = words[temp];
            ob.match = f;
        }
        query.query.bool.must.push(ob);
    }
}
function createQuery(includeTextField) {
    var query = JsonTool.cloneJSON(defaultObj);
    var ob;
    var boolOr = JSON.parse("{\"bool\":{\"should\":[]}}");
    for (var temp = 0; temp < checkboxArray.length; temp++) {
        if (checkboxArray[temp].checked == true) {
            var field = JSON.parse("{\"emneSti\":\"" + checkboxArray[temp].collection + "#" + checkboxArray[temp].topic + "\"}");
            //      var field = JSON.parse("{\"fagmiljøer\":\"" +checkboxArray[temp].topic + "\"}");
            ob = new Object();
            ob.term = field;
            boolOr.bool.should.push(ob);
        }
    }
    pagePos = 0;
    if (boolOr.bool.should.length > 0)
        query.query.bool.must.push(boolOr);
    if (includeTextField)
        insertWordSearch(query);
    var str = document.getElementById("keywordList").value;
    if (str != "") {
        //gjenstandstyper
        var field = JSON.parse("{\"gjenstandstyper\":\"" + str + "\"}");
        var keyword = new Object();
        keyword.term = field;
        query.query.bool.must.push(keyword);
    }
    //  alert(JSON.stringify(query,null,2));
    return query;
}
function search() {
    wheelInstance.clearUl();
    wheelInstance.hideOverlay();
    runQuery = createQuery(true);
    if (randomNumber > 0) {
        runQuery.from = randomNumber;
        pagePos = randomNumber;
        randomNumber = 0;
    }
    else {
        runQuery.from = 0;
        pagePos = 0;
    }
    runQuery.sort = sortPhoto;
    sessionStorage.setItem("muvQuery", JSON.stringify(runQuery, null, 2));
    createSearchLabel();
    var formData = new Object();
    formData.elasticdata = JSON.stringify(runQuery, null, 2);
    //    alert(formData.elasticdata);
    formData.resturl = Tools.elSearchPath();
    postPhpMain(formData, fillResult);
}
function createSearchLabel() {
    var searchString = "";
    var topics = "";
    var delim = "";
    if (document.getElementById("inputField").value != "") {
        searchString = "<b><i>Søkeord:<i></b>" + document.getElementById("inputField").value;
    }
    for (var temp = 0; temp < checkboxArray.length; temp++) {
        if (checkboxArray[temp].checked == true) {
            topics += delim + " " + checkboxArray[temp].topic;
            delim = ",";
        }
    }
    if (searchString != "" && topics != "")
        searchString += "&nbsp;";
    if (topics != "")
        searchString += "<b><i>Fagmiljøer:</i></b>" + topics + "&nbsp;";
    if (document.getElementById('keywordList').value != "")
        searchString += "<b><i>Stikkord:</i></b>&nbsp;" + document.getElementById('keywordList').value;
    if (searchString == "")
        searchString = "<b><i>Alle poster</i></b>";
    sessionStorage.setItem("muvLabel", searchString);
}
//xxxx
function fillResult(data) {
    document.getElementById('resultTable').innerHTML = "";
    resultElastic = new ElasticClass(data);
    var docs = resultElastic.getDocs();
    if (docs.length == 1) {
        window.location.href = "gjenstand.html?id=" + resultElastic.getSingleFieldFromDoc(docs[0], "museumKey");
        return;
    }
    for (var temp = 0; temp < docs.length; temp++) {
        var pA = resultElastic.getArrayFromDoc(docs[temp], "fotos");
        var gj = resultElastic.getArrayFromDoc(docs[temp], "gjenstandsnavn");
        if (pA.length == 0)
            insertInResultTable("resultTable", "xxxxxx", temp, resultElastic.getSingleFieldFromDoc(docs[temp], "museumKey"), gj[0], columnsInResult, "175px", "small");
        else
            insertInResultTable("resultTable", pA[0], temp, resultElastic.getSingleFieldFromDoc(docs[temp], "museumKey"), gj[0], columnsInResult, "150px", "small");
    }
    setTraversalDiv();
}
function insertContentIntoRelationTable(table, content) {
    if (content == "")
        return;
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.innerHTML = content;
}
/*
function postPhpMain(formData, callBack) {
  $.ajax({
    url: "passpost.php",
    type: 'post',
    data: formData,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
    },
    success: function (data) {
      callBack(data);
    },
    dataType: "json"
  });
}
*/
function postPhpMain(formData, callBack) {
    $.ajax({
        url: Tools.urlToNode + formData.resturl,
        //      url: "http://itfds-utv01.uio.no/postgres/PassPost/"+formData.resturl,
        type: 'post',
        data: formData.elasticdata,
        contentType: 'application/json',
        //    data: JSON.parse(formData.elasticdata),
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            callBack(data);
        },
        dataType: "json"
    });
}
function insertInResultTable(tableId, filename, nr, id, name, cellsprRow, width, type) {
    //    let cellsprRow:number= 2;
    var table = document.getElementById(tableId);
    var row;
    if ((nr % cellsprRow) == 0)
        row = table.insertRow(-1);
    else
        row = table.rows[table.rows.length - 1];
    var cellSize = row.cells.length;
    var cell1 = row.insertCell(cellSize);
    cell1.setAttribute("class", "cellLabel"); //For Most Browsers
    cell1.setAttribute("className", "cellLabel");
    cell1.setAttribute("style", "vertical-align:top;");
    //http://itfds-utv01.uio.no/postgres/
    //  var img = "<img  onload='calcPhotoSize(150,200,\"img"+nr+"\")' id='img"+nr+ "' src='http://www.unimus.no/felles/bilder/web_hent_bilde.php?filename=" + filename + "&type=" + type + "' height="+width+"/>";
    var img = "<img  onload='calcPhotoSize(150,200,\"img" + nr + "\")' id='img" + nr + "' src='" + Tools.urlToImage + "?filename=" + filename + "&type=" + type + "' height=" + width + "/>";
    var aref = "<a target='_blank' href='gjenstand.html?id=" + id + "'>" + img + "</a>";
    if (name.length > 30)
        name = name.substring(0, 30) + "..";
    cell1.innerHTML = name.substring(0, 30) + "<br>" + aref;
}
function setTraversalDiv() {
    var nrOfDocs = resultElastic.getDocCount();
    document.getElementById('zeroButtonId').disabled = false;
    if (pagePos == 0)
        document.getElementById('prevButtonId').disabled = true;
    else
        document.getElementById('prevButtonId').disabled = false;
    if ((pagePos + pageSize) >= nrOfDocs)
        document.getElementById('nextButtonId').disabled = true;
    else
        document.getElementById('nextButtonId').disabled = false;
    var to = pagePos + pageSize;
    if (to > nrOfDocs)
        to = nrOfDocs;
    var str = (pagePos + 1) + "-" + to + "  antall gjenstander ut av " + nrOfDocs;
    if (nrOfDocs == 0)
        str = "Ingen gjenstander funnet";
    document.getElementById('traversalLabel').innerHTML = str;
}
function move(i) {
    var toMove = (i * pageSize) + pagePos;
    if (toMove < 0)
        toMove = 0;
    runQuery.from = toMove;
    sessionStorage.setItem("muvQuery", JSON.stringify(runQuery, null, 2));
    pagePos = toMove;
    var formData = new Object();
    formData.elasticdata = JSON.stringify(runQuery, null, 2);
    formData.resturl = Tools.elSearchPath();
    postPhpMain(formData, fillResult);
}
function setToZero() {
    for (var temp = 0; temp < checkboxArray.length; temp++)
        checkboxArray[temp].checked = false;
    document.getElementById("inputField").value = "";
    document.getElementById('keywordList').value = "";
    search();
}
//-----------------------------wheel functions
function changeWordwheel(event) {
    /*if(event.keyCode == 13){
      search();
      return;
   }*/
    if (wheelInstance.handleWheel(event) == true)
        return;
    var str = document.getElementById('inputField').value.toLowerCase();
    if (str.length > 1) {
        wordListQuery.tags.terms.include = str + ".*";
        var query = createQuery(false);
        query.aggs = wordListQuery;
        query.size = 0;
        var formData = new Object();
        formData.elasticdata = JSON.stringify(query, null, 2);
        formData.resturl = Tools.elSearchPath();
        $.ajax({
            url: "passpost.php",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: function (data) {
                var el = new ElasticClass(data);
                var ar = el.getFacetFieldWithFacetName("tags");
                //                alert(JSON.stringify(ar,null,2));
                wheelInstance.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance.clearUl();
        wheelInstance.hideOverlay();
    }
}
function lookupIndex(string) {
    document.getElementById('inputField').value = wheelInstance.replaceLastWord(document.getElementById('inputField').value, string);
    wheelInstance.hideOverlay();
    search();
}
function resize() {
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
    var gridContainer = document.getElementById("gridContainer");
    gridContainer.style.height = window.innerHeight + "px";
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
    var resultdiv = document.getElementById('resultDiv');
    if (resultdiv.clientHeight < 1000)
        rowsInResult = Math.round(resultdiv.clientHeight / 225);
    else
        rowsInResult = Math.round(1000 / 225);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
    defaultObj.size = Math.round(columnsInResult * rowsInResult);
    pageSize = defaultObj.size;
    if (runQuery != null) {
        runQuery.size = pageSize;
        move(0);
    }
}
/*
function testImages(){
  var length = resultElastic.getDocs().length;
  var temp;
  for(temp=0;temp < length;temp++){
    var st = "img"+temp;
    (<HTMLImageElement>document.getElementById(st)).onload = function () {
      calcPhotoSize(200, 200, st);
     };
  
  }
}
*/
function calcPhotoSize(height, width, photoId) {
    height -= 10;
    width -= 10;
    var oldHeight = document.getElementById(photoId).height;
    var oldWidth = document.getElementById(photoId).width;
    if (oldHeight < height && oldWidth < width) {
        document.getElementById(photoId).height = oldHeight;
        document.getElementById(photoId).width = oldWidth;
        return;
    }
    if (oldHeight > height) {
        var reduce = void 0;
        reduce = (height * 100) / oldHeight;
        var newWidth = (oldWidth * reduce) / 100;
        if (newWidth > width) {
            reduce = (width * 100) / oldWidth;
            document.getElementById(photoId).width = width;
            var newHeight = (oldHeight * reduce) / 100;
            document.getElementById(photoId).height = newHeight;
        }
        else {
            document.getElementById(photoId).height = height;
            document.getElementById(photoId).width = newWidth;
        }
    }
    else {
        var reduce = (width * 100) / oldWidth;
        var newHeight = (oldHeight * reduce) / 100;
        document.getElementById(photoId).height = newHeight;
        document.getElementById(photoId).width = width;
    }
}
