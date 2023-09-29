const fileRegex = /\.(sal)$/

import loader from "./loader"


function getMethods(obj)
{
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] == "function") {
            res.push(m)
        }
    }
    return res;
}
/**
 * 
   path sourceucture:

   {
  "parent": {...},
  "node": {...},
  "hub": {...},
  "contexts": [],
  "data": {},
  "shouldSkip": false,
  "shouldStop": false,
  "removed": false,
  "state": null,
  "opts": null,
  "skipKeys": null,
  "parentPath": null,
  "context": null,
  "container": null,
  "listKey": null,
  "inList": false,
  "parentKey": null,
  "key": null,
  "scope": null,
  "type": null,
  "typeAnnotation": null
}
 */





export default function Plugin() {

  return {
    name: 'transform-file',

    transform:(source, id)=> {

      if (fileRegex.test(id)) {



       let finalCode  = loader(source)
      //  let  nodeId = nanoid(14)


      //  //console.log("code", code, output.code)
        return {
          code:finalCode,
          map: null, // provide source map if available
        }
      }
    },


  }
}



