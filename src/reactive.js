
import {WatchEffect} from "./effect"


let addProp = (obj, prop, watcher, )=>{

    if(!obj.__watching){
        Object.defineProperty(obj, "__watching",{value: {} , configurable:true} )
          }

   
    if(prop == "constructor") return
    if(prop == "__proto__") return

    if(typeof obj[prop]  == "function") return 
    if(typeof obj[prop]  == "Symbol") return
    let watchers = obj.__watching[prop]  = obj.__watching[prop]  || []
   
    if(!watchers?.includes)debugger


    if(!watchers.includes(watcher)) watchers.push(watcher)

}


let updating = []

let updateQueue = []
let updatingNodes = false

class UpdateQueue{

    static queue = new Map()
    static push(target, prop, callback, args){


        if(!this.queue.has(callback)) this.queue.set(callback, args)

        setTimeout(()=>{
         if(!this.running) this.run()
        })
    }
    static run(){

        this.running = true

        setTimeout(()=>{
 
            let callbacksRan = []
            let targetsRan = []

            let n = 0
            for (const [callback, args] of this.queue.entries()) {

      

                //avoid repeting callback
                if(callbacksRan.includes(callback)) return 
                callbacksRan.push(callback)

    

                if(callback instanceof WatchEffect) callback.call() 

                if(typeof callback == "function"){
                    callback(args)
                }
              }
   
        
            this.running = false

        })
      
 
      
    }
    static includes(callback){
        return this.queue.includes(callback)
    }
       

}



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
                       
                          UpdateQueue.push(target, prop, callback,{oldValue, newValue, prop, target} )

                        // if( updating.includes(callback))  return
                      
                        // updating.push(callback)


                        // setTimeout(()=>{
                        //     if(callback instanceof WatchEffect) callback.call() 

                        //     if(typeof callback == "function"){
                        //         callback({oldValue, newValue, prop, target})
                        //     }
                        // })

                        if(callback.runs > 100) debugger
                        callback.runs =  callback.runs?callback.runs++:1 
                        
                       
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