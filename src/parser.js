const fileRegex = /\.(sal)$/
import babel from "@babel/core"
import { nanoid } from 'nanoid'



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
   path structure:

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
   

    transform:(str, id)=> {

      if (fileRegex.test(id)) {


        let replacers = []
       let output =  babel.transformSync(str, {
        presets: ["@babel/preset-react"],
     
       })

        
      

        
       let reactCode = output.code

       //with regex of the generated code
        //replace function with object
        
          // reactCode = reactCode.replaceAll(/React.createElement\(.+?(\w+).+?,/g, "{ component: $1,\n props:")
          let i = 0
          //instead of an id, which will be repeated on compeonents create an unique index in the component
         let  finalCode = reactCode.replaceAll(/React.createElement\(/g, ()=>{

            //  return `__createNode( '_${nanoid(14)}', `
             return `__createNode( '_${nanoid(14)}', '_${i++}', `

         })
        finalCode = "import {createNode as __createNode} from 'salvue/sNode' \n  " + finalCode
  
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