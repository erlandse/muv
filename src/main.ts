
let checkbox = null;
let checkboxArray: any = null;
var navigationQuery = "{\"size\":0,\"aggs\":{\"museum\":{\"terms\":{\"field\":\"museumsid\",\"order\":{\"_term\":\"asc\"},\"size\":1000},\"aggs\":{\"fag\":{\"terms\":{\"field\":\"fagmiljøer\",\"order\":{\"_term\":\"asc\"},\"size\":1000}}}}}}";
var defaultObj: any = null;
let runQuery: any = null;
var spaceSplitter = new RegExp("([\\s]+)", "g");
let pagePos: number = 0;
let pageSize = 12;
let resultElastic: ElasticClass;
let randomNumber: number = 0;
let wheelInstance: Wheel = null;
let rowsInResult = 0;
let columnsInResult = 0;
let museumArray = null;
let firstTime=false;



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

]


//Math.floor((Math.random() * 10) + 1);
//    randomNumber= Math.floor((Math.random()*(es.getDocCount()-pageSize)+1)); 
interface String {
  endsWith(pattern): any;
}

String.prototype.endsWith = function (pattern) {
  var d = this.length - pattern.length;
  return d >= 0 && this.lastIndexOf(pattern) === d;
};

function qCollectionDisplay(museum) {
  for (let temp = 0; temp < collections.length; temp++)
    if (museum == collections[temp].field)
      return (collections[temp].display);
  return museum;
}


function continueInitialize(){
  wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
  (<HTMLInputElement>document.getElementById('inputField')).value = "";
  var d = JSON.parse("{\"must\":[]}");
  defaultObj = JsonTool.createJsonPath("query");
  defaultObj.query.bool = d;
  defaultObj.size = pageSize;
  var formData: any = {};
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
  let formData:any = new Object();
  formData.resturl=Tools.elSearchPath()+"?q=hasPhoto:1";
  formData.elasticdata=new Object();
  formData.elasticdata.size=0;
  formData.elasticdata= JSON.stringify(formData.elasticdata,null,2);
  postPhpMain(formData,findRandomNumber);
}

function findRandomNumber(data){
 let el:ElasticClass = new ElasticClass(data);
 randomNumber= Math.floor((Math.random()*(el.getDocCount()-pageSize)+1)); 
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
  let table: HTMLTableElement = <HTMLTableElement>document.getElementById('navigationTable');
  museumArray = data.aggregations.museum.buckets;
  for( var temp = 0;temp< museumArray.length;temp++)
     museumArray[temp].showSubject=false;
  displayNavigationList();
  let keywordSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById('keywordList');
  let arr = es.getFacetFieldWithFacetName("keywords");
  Tools.addOption(keywordSelect, "Velg", "");
  for (let temp = 0; temp < arr.length; temp++) {
    if (arr[temp].key != "")
      Tools.addOption(keywordSelect, arr[temp].key, arr[temp].key);
  }
  setToZero();
}

function displayNavigationList(){
  document.getElementById('navigationTable').innerHTML="";
  let table: HTMLTableElement = <HTMLTableElement>document.getElementById('navigationTable');
  insertContentIntoRelationTable(table,"<br>");
  for (var temp = 0; temp < museumArray.length; temp++) {
    var collection = museumArray[temp].key.trim();
    if(collection == "")
      continue;
    collection = qCollectionDisplay(collection);
    if(museumArray[temp].showSubject == true)
       insertContentIntoRelationTable(table,"<a href='javascript:switchMuseum("+temp+")' style='color:#0000ff;text-decoration:none;'>"+ collection + " (" + museumArray[temp].doc_count + ")&nbsp;<span style='font-size: 1.4em;'>-</span></a>");
    else   
       insertContentIntoRelationTable(table,"<a href='javascript:switchMuseum("+temp+")' style='color:#0000ff;text-decoration:none;'>"+ collection + " (" + museumArray[temp].doc_count + ")&nbsp;<span style='font-size: 1.4em;'>+</span></a>");

    if(museumArray[temp].showSubject == true){
      let fag: any = museumArray[temp].fag;
      for (let i = 0; i < fag.buckets.length; i++) {
        let key: string = fag.buckets[i].key;
        let cnt = fag.buckets[i].doc_count;
      //         insertContentIntoRelationTable(table,key+ " ("+ cnt +")");
        createCheckBox(table, key, cnt, museumArray[temp].key.trim());
     }
    }
    insertContentIntoRelationTable(table,"<br>");

  }
}

function switchMuseum(index){
  randomNumber=pagePos;
  for(var temp=0;temp < checkboxArray.length;temp++)
     if(checkboxArray[temp].checked==true)
       randomNumber=0;
  museumArray[index].showSubject = museumArray[index].showSubject == true?false:true;
  setToZero();
  displayNavigationList();
  
}

function createCheckBox(table, key, cnt,collection) {
  checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = "ch" + checkboxArray.length;
  checkbox.id = "ch" + checkboxArray.length;
  let i = checkboxArray.length;
  checkbox.onclick = function () { onClickCheckbox(i); };
  checkbox.topic = key;
  checkbox.collection = collection;
  checkboxArray.push(checkbox);
  var row = table.insertRow(-1);
  let cell1: HTMLTableCellElement = <HTMLTableCellElement>row.insertCell(0);
  cell1.appendChild(checkbox);
  let label = document.createElement('SPAN');
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
function onClickCheckbox(i: number) {
  search();
}

function insertWordSearch(query) {
  let ob: any;
  let b: string = (<HTMLInputElement>document.getElementById('inputField')).value.trim();
  if (b.length == 0)
    return;
  let arr = b.split(".");
  if(arr.length > 2){
    let f: any = new Object();
    ob = new Object();
    f.museumKey = b;
    ob.match = f;
    query.query.bool.must.push(ob);
    return;
  }
  
  
  let qu: string;
  qu = b.replace(this.spaceSplitter, "####");
  var words = qu.split("####");
  for (let temp = 0; temp < words.length; temp++) {
    let pos: number;
    let f: any = new Object();
    ob = new Object();
    if (words[temp].indexOf("*") != -1 || words[temp].indexOf("?") != -1) {
      f.textcontainer = words[temp];
      ob.wildcard = f;
    } else {
      f.textcontainer = words[temp];
      ob.match = f;
    }
    query.query.bool.must.push(ob);
  }
}


function createQuery(includeTextField) {
  let query = JsonTool.cloneJSON(defaultObj);
  let ob: any;
  let boolOr: any = JSON.parse("{\"bool\":{\"should\":[]}}");
  for (var temp = 0; temp < checkboxArray.length; temp++) {
    if (checkboxArray[temp].checked == true) {
      var field = JSON.parse("{\"emneSti\":\"" +checkboxArray[temp].collection+"#"+checkboxArray[temp].topic + "\"}");
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
  let str: string = (<HTMLSelectElement>document.getElementById("keywordList")).value;
  if (str != "") {
    //gjenstandstyper
    var field = JSON.parse("{\"gjenstandstyper\":\"" + str + "\"}");
    var keyword: any = new Object();
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
  } else {
    runQuery.from = 0;
    pagePos = 0;
  }
  runQuery.sort = sortPhoto;
  sessionStorage.setItem("muvQuery", JSON.stringify(runQuery, null, 2));
  createSearchLabel();
  let formData: any = new Object();
  formData.elasticdata = JSON.stringify(runQuery, null, 2);
  //    alert(formData.elasticdata);
  formData.resturl = Tools.elSearchPath();
  postPhpMain(formData, fillResult);
}

function createSearchLabel() {
  let searchString = "";
  let topics: string = "";
  let delim: string = "";
  if ((<HTMLInputElement>document.getElementById("inputField")).value != "") {
    searchString = "<b><i>Søkeord:<i></b>" + (<HTMLInputElement>document.getElementById("inputField")).value;
  }
  for (let temp = 0; temp < checkboxArray.length; temp++) {
    if (checkboxArray[temp].checked == true) {
      topics += delim + " " + checkboxArray[temp].topic;
      delim = ",";
    }
  }
  if (searchString != "" && topics != "")
    searchString += "&nbsp;";
  if (topics != "")
    searchString += "<b><i>Fagmiljøer:</i></b>" + topics + "&nbsp;";
  if ((<HTMLSelectElement>document.getElementById('keywordList')).value != "")
    searchString += "<b><i>Stikkord:</i></b>&nbsp;" + (<HTMLSelectElement>document.getElementById('keywordList')).value

  if (searchString == "")
    searchString = "<b><i>Alle poster</i></b>";
  sessionStorage.setItem("muvLabel", searchString);
}
//xxxx
function fillResult(data) {
  document.getElementById('resultTable').innerHTML = "";
  resultElastic = new ElasticClass(data);
  var docs = resultElastic.getDocs();
  if (docs.length == 1){
    window.location.href="gjenstand.html?id="+resultElastic.getSingleFieldFromDoc(docs[0], "museumKey");
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
    url: Tools.urlToNode+formData.resturl,
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
  let table: HTMLTableElement = <HTMLTableElement>document.getElementById(tableId);
  var row: any;
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

  var img = "<img  onload='calcPhotoSize(150,200,\"img"+nr+"\")' id='img"+nr+ "' src='"+Tools.urlToImage+"?filename=" + filename + "&type=" + type + "' height="+width+"/>";

  var aref = "<a target='_blank' href='gjenstand.html?id=" + id + "'>" + img + "</a>";
  if(name.length > 30)
     name = name.substring(0,30)+ "..";
  cell1.innerHTML = name.substring(0,30) + "<br>" + aref;

}

function setTraversalDiv() {
  let nrOfDocs = resultElastic.getDocCount();
  (<any>document.getElementById('zeroButtonId')).disabled = false;

  if (pagePos == 0)
    (<any>document.getElementById('prevButtonId')).disabled = true;
  else
     (<any>document.getElementById('prevButtonId')).disabled = false;
  if ((pagePos + pageSize) >= nrOfDocs)
    (<any>document.getElementById('nextButtonId')).disabled = true;
  else
     (<any>document.getElementById('nextButtonId')).disabled = false;
  let to = pagePos + pageSize;
  if (to > nrOfDocs)
    to = nrOfDocs;
  let str = (pagePos + 1) + "-" + to + "  antall gjenstander ut av " + nrOfDocs;
  if (nrOfDocs == 0)
    str = "Ingen gjenstander funnet";
  document.getElementById('traversalLabel').innerHTML = str;
}

function move(i) {
  let toMove = (i * pageSize) + pagePos;
  if (toMove < 0)
    toMove = 0;
  runQuery.from = toMove;
  sessionStorage.setItem("muvQuery", JSON.stringify(runQuery, null, 2));
  pagePos = toMove;
  let formData: any = new Object();
  formData.elasticdata = JSON.stringify(runQuery, null, 2);
  formData.resturl = Tools.elSearchPath();
  postPhpMain(formData, fillResult);
}

function setToZero() {
  for (var temp = 0; temp < checkboxArray.length; temp++)
    checkboxArray[temp].checked = false;
  (<HTMLInputElement>document.getElementById("inputField")).value = "";
  (<HTMLSelectElement>document.getElementById('keywordList')).value = "";
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
  var str = (<HTMLInputElement>document.getElementById('inputField')).value.toLowerCase();
  if (str.length > 1) {
    wordListQuery.tags.terms.include = str + ".*";
    let query: any = createQuery(false);
    query.aggs = wordListQuery;
    query.size = 0;
    let formData: any = new Object();
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
  } else {
    wheelInstance.clearUl();
    wheelInstance.hideOverlay();
  }
}

function lookupIndex(string) {
  (<HTMLInputElement>document.getElementById('inputField')).value = wheelInstance.replaceLastWord((<HTMLInputElement>document.getElementById('inputField')).value, string);
  wheelInstance.hideOverlay();
  search();
}

function resize() {
  if (wheelInstance != null) {
    wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
  }
  let gridContainer = document.getElementById("gridContainer"); 
  gridContainer.style.height = window.innerHeight+"px";
  let footElement = document.getElementById("app-footer");
  footElement.style.width = window.innerWidth-(50)+"px";
  let resultdiv = document.getElementById('resultDiv');
  if(resultdiv.clientHeight < 1000)
    rowsInResult = Math.round(resultdiv.clientHeight / 225);
  else
    rowsInResult = Math.round(1000 / 225);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
  defaultObj.size = Math.round(columnsInResult*rowsInResult);
  pageSize = defaultObj.size;
  if(runQuery != null){
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
  height -=10;
  width -=10;
  var oldHeight = (<HTMLImageElement>document.getElementById(photoId)).height;
  var oldWidth = (<HTMLImageElement>document.getElementById(photoId)).width;
  if (oldHeight < height && oldWidth < width){
        (<HTMLImageElement>document.getElementById(photoId)).height = oldHeight;
        (<HTMLImageElement>document.getElementById(photoId)).width = oldWidth;
        return;
  }
  if (oldHeight > height) {
    let reduce;
    reduce = (height * 100) / oldHeight;
    let newWidth = (oldWidth * reduce) / 100;
    if (newWidth > width) {
      reduce = (width * 100) / oldWidth;
      (<HTMLImageElement>document.getElementById(photoId)).width = width;
      let newHeight = (oldHeight * reduce) / 100;
      (<HTMLImageElement>document.getElementById(photoId)).height = newHeight;
    } else {
      (<HTMLImageElement>document.getElementById(photoId)).height = height;
      (<HTMLImageElement>document.getElementById(photoId)).width = newWidth;
    }
  }else{
     let reduce= (width*100)/oldWidth;
     let newHeight=(oldHeight * reduce) / 100;
     (<HTMLImageElement>document.getElementById(photoId)).height = newHeight;
     (<HTMLImageElement>document.getElementById(photoId)).width = width;
  
  }
  
}
