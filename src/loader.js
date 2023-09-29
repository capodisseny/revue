import babel from "@babel/core"
import { nanoid } from 'nanoid'
import presetreact from "@babel/preset-react"
function loader(source){
    

    let replacers = []
    let output =  babel.transformSync(source, {
     presets: [presetreact],
  
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


     return finalCode
  
  
  }
  
  export default loader

