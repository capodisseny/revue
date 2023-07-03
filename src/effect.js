export class  WatchEffect {
    static current = false
    
    constructor(callback, options = {}){

        this.callback = callback

        if(options?.runsLeft) this.runsLeft = options.runsLeft
    }
   
    // startAt = 0 // by deffault on initialitzation
    runsLeft = -1 //# of runs,  by default,  no stop, 


   
    init(){
        this.call()
    }
    call(){
        if(this.runsLeft === 0) return
       
        this.current =  this.constructor.current
        this.constructor.current = this
        // setTimeou(()=>{
        //     this.callback()
        // },0)
        this.callback()

        this.constructor.current = this.current

        if(this.runsLeft) this.runsLeft--
    }
    stop(){
        this.runsLeft = 0
    }
 
}



let effect =  (callback, options)=>{

    let effect = new WatchEffect(callback, options)

    effect.init()
}


    export default effect