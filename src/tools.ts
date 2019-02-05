
class Tools {
  constructor() {
  }
  static addOption(elSel: HTMLSelectElement, text: string, value: any) {
    let elOptNew: HTMLOptionElement = document.createElement('option');
    elOptNew.text = text;
    elOptNew.value = value;
    elSel.appendChild(elOptNew);
  }
  
  static removeOptionSelected(selectId: string) {
    let elSel: any = <HTMLSelectElement>document.getElementById(selectId);
    var i;
    for (i = elSel.length - 1; i >= 0; i--) {
      if (elSel.options[i].selected) {
        elSel.remove(i);
      }
    }
  }

  static removeAllOptions(selectId:string) {
    let elSel: HTMLSelectElement = <HTMLSelectElement>document.getElementById(selectId);
    while (elSel.length > 0)
      elSel.remove(elSel.length - 1);
  }
  
  static selectAllOptions(selectId:string) {
    let sel:any = <HTMLSelectElement>document.getElementById(selectId);
    for (var temp = 0; temp < sel.length; temp++)
      sel.options[temp].selected = true;
  }

  static gup(name:string) :string {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return results[1];
  }

  static elSearchPath(){
    return "runmuv/gjenstand/_search";

  }
/*
static urlToGetAny = "https://nabu.usit.uio.no/unifotonode/GetAnyURL/";
static urlToNode = "https://nabu.usit.uio.no/elasticapinabu/";
static urlToImage = "https://nabu.usit.uio.no/unifotonode/Image/";
static urlToPDF = "https://nabu.usit.uio.no/unifotonode/PDF/";
*/
//static urlToNode = "http://itfds-utv01.uio.no/elasticapinabu/";
static urlToNode = "https://nabu.usit.uio.no/elasticapinabu/";

static urlToImage = "http://itfds-utv01.uio.no/postgres/Image/";
static urlToPDF = "http://itfds-utv01.uio.no/postgres/PDF/";
static urlToGetAny = "http://itfds-utv01.uio.no/postgres/GetAnyURL/";


}