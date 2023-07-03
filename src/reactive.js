
import {WatchEffect} from "./effect"


let addProp = (obj, prop, watcher, )=>{

    if(!obj.__watching){
        Object.defineProperty(obj, "__watching",{value: {} , configurable:true} )
          }

   
    if(prop == "constructor") return
    if(prop == "__proto__") return

    let watchers = obj.__watching[prop]  = obj.__watching[prop]  || []
   
    if(!watchers.includes)debugger

    if(!watchers.includes(watcher)) watchers.push(watcher)

}


let updating = []
let updatingNodes = false
let reactive = (obj, callback , skip)=>{

    if(typeof obj !== "object" || !obj) return obj


    if(obj.__skipReactive) return obj;

    if(obj.__proxy) return obj.__proxy

    let proxy = new Proxy( 
        obj, 
        {
            get:(target, prop,  receiver)=>{
                

                if(prop == "__proxy") return receiver
                
                if(skip && skip(target, prop,  receiver)) return target[prop]
                
                // if(prop == "length") console.log("lengggggg")
                //inside a watch effect return add to watchers
                // if(prop == "count")debugger

                if(WatchEffect.current ) addProp(target, prop, WatchEffect.current, )
                if(callback ) addProp(target, prop, callback, )

                return reactive(target[prop])
            },
            set:(target, prop,value,)=>{

                let oldValue = target[prop]

                let dontSkip = false
                
                //don't skip length property on arrays
                if(prop == "length" && Array.isArray(target)) dontSkip = true
                               
                //skip same values
                if(oldValue === value  && !dontSkip) return true
                
                let newValue = target[prop] = value

                if(obj.__watching){
                  
                    obj.__watching[prop]?.forEach(callback=>{

                        if( updating.includes(callback))  return
                      
                        updating.push(callback)
                        setTimeout(()=>{
                            if(callback instanceof WatchEffect) callback.call() 

                            if(typeof callback == "function"){
                                callback({oldValue, newValue, prop, target})
                            }
                        })
                     

                        if(callback.runs > 100) debugger
                        callback.runs =  callback.runs++ 
                        
                       
                    })


                    setTimeout(()=>{
                        updating.length = 0

                    })

                
                }


                return true
            
            },
            apply(target, thisArg, argumentsList){
                
                return target.call(thisArg, argumentsList)
            }
            
            
        }
        )

    Object.defineProperty(obj, "__proxy", {value: proxy})
    return proxy

}
export default reactive