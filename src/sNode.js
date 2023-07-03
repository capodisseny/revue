import effect from "./effect"
import { nanoid } from 'nanoid'
import flatten from "lodash/flatten"
import isEqual from "lodash/isEqual"

import reactive from "./reactive"

let emptySlot = ()=>null




/**Listeners 
 * https://stackoverflow.com/questions/446892/how-to-find-event-listeners-on-a-dom-node-in-javascript-or-in-debugging/6434924#6434924
 * 
*/

Node.prototype.realAddEventListener = Node.prototype.addEventListener;
Node.prototype.realRemoveEventListener = Node.prototype.removeEventListener;

// Node.prototype.addEventListener = function(e,b,c){
//     this.realAddEventListener(e,b,c); 
//     this.salListeners  =  this.salListeners  || {}
//     this.salListeners[e] = this.salListeners[e] || []
    
//     this.salListeners[e].push({name:e, listener:b, options:c})
  
// };

// Node.prototype.removeEventListener = function(e,b,c){
//     this.realRemoveEventListener(e,b,c); 
//     let listeners = this.salListeners[e]

//     listeners.forEach((event, i)=>{
//         if(event.listener == b) listeners.splice(i, 1)
//     })
  
// };



function render(updateObj, parentEl, context){


    let node

    // effect(()=>{


    //     if(t == "function" ) updateObj = updateObj(context)


    // })

    if(updateObj.render){

        updateObj = {
         
            type:updateObj,
        }
    }

    let id =  "sal_"+nanoid(4) 
    //on functions and comonents
    updateObj.index = id
    updateObj.id =  id

    node = sNode.create(updateObj, context, {index:0})


    let el = node.el
    if(node.root) el = node.root.el
    
    if(
         parentEl && el != parentEl 
         && parentEl.childNodes && ![...parentEl.childNodes].includes(el)
     ) {
         if(node instanceof NodeList) parentEl.append(...el);
         else parentEl.append(el);
     }


     return node


}
let shouldRender = (obj)=>{
    if(!obj && obj !== 0) return

    return true
}
let isTextNode = (val)=>{

    if(typeof val !== "object") return true

    if(!val?.index) return true
    if(!val?.type) return true

    return false


}
class sNode{

    el = false
    children = []
    attrs = {}
    static nodes = {}
    traverseTree(callback, payload){

        callback(this, payload)

        this.children.forEach((child, i)=>{

            child.traverseTree(callback, payload)
        })
    }
    static create(updateObj, renderCtx = {}, params = {} ){


        if(updateObj instanceof sNode) debugger

        let { parent, pastObj, node, index  } = params

       
        //skip process 
        // if(shouldRender(updateObj)) return;


        if(!index && index !== 0)debugger
        // if(!parent?.index)debugger
        //  updateObj.id = `${parent?.index}_compI${updateObj.index }_childI${index}`

        if(! updateObj?.id)debugger



        let id = `_${updateObj.id}`
      
        if(updateObj?.key) id = id + `_key:${updateObj?.key}`
        if(parent?.id ) id =  id +  `_${parent.id}` 


        params.id = id

         node = this.nodes[id]


       

        //  if(updateObj.index == "_10")debugger
   
        //check if need to create or update
        if(node ) {
            

            pastObj = node.pastObj
            
             node.update( {updateObj, pastObj})
    
 
            let payload = {updateObj, pastObj}
            //  console.log("PATCHING:", updateObj, node)
          
            return node
        }
        else {

          
          

            node = new sNode(updateObj,renderCtx, params)

             console.log("creating...",node, updateObj,node.id, updateObj?.id, id)
    
        }

        if(parent) {
            // node.parent = parent
            // parent.addChild(node, index)
        }

   
        return node

    }
    constructor(updateObj, renderCtx , internalContext ){
        let {id, parent} =internalContext

        if(!id)debugger
        this.index = updateObj.index
        //internal id  //do not set id to the updateObj
        this.id = id
        // this.id =  updateObj.id || "sal_"+nanoid(14)
        // this.id =  updateObj.id || "sal_"+nanoid(14)
        //for manipulating dom
        this.uuid =  "sal_"+nanoid(14)
        this.parent = internalContext.parent


        if(!this.constructor.nodes[this.id]){
            this.constructor.nodes[this.id] = this
        }
        

        this.create(updateObj, renderCtx, )
     }
    
    create(updateObj, parentContext = {} ){
       
        let t = typeof  updateObj

        if(updateObj?.render) debugger
    
        //set the node basics
    
        this.updateObj = updateObj
        this.context = parentContext
        this.type = updateObj?.type




         //node object
         if(updateObj && t == "object" ){
            let reRender
            this.type = updateObj?.type

            if(!this.type) debugger


            if(typeof this.type == "object"){

                this.component = updateObj.type
                this.render =  this.type.render
                this.setup =  this.type.setup

                 //outsite of the effect
                 //TODO: here when accessing context will not be props... 
                 //but functions declared inside the setup function will have acces to it because will be assigned to the context
                 //rethin that. The important point is to avoid setup to react to change 
                // if( this.component.setup)  this.component.setup.call(this, parentContext)

                effect(()=>{    


                    if(this.updating) debugger
                    this.updating = true

                    console.time("update time:")
                    //when is a rerender, update the node
                    this.update({updateObj}, parentContext )
                    console.timeEnd("update time:")
        

                    this.updating = false
                    // this.updateObj =  updateObj  
                    reRender = true
                    
                })

                this.renderComponentStyle()

                //don't need to create the element or update, since will be dealed by the root
                return 
            }
           

    

           
        }

        //when is a render function or a component watch for changes
        if(t == "function" ){

            if(updateObj.name == "after") debugger
            let reRender
            this.render = updateObj
            effect(()=>{

                console.time("rnder function update time:")
                              
                this.update({updateObj})
                console.timeEnd("rnder function  update time:")
     
                reRender = true
                
            })


            return
            
        }


        this.update({updateObj})

      


    }
    update(params = {}){


        let {updateObj} = params

        this.updateObj = updateObj



        if(!updateObj)debugger
        
       
        //render function or component
        if(this.render){        

            //if is a component, the dom part will be done by the root
            if(this.component) {
                let context = this.generateContext(this.context, updateObj)

                if( this.setup && !this.setupRan)  {
                    this.setup.call(this, context)
                    this.setupRan = true
                }

                // if(this.type.name == "Button") debugger
                 updateObj = this.render(context)



    

                //skip update process
                if(!shouldRender(updateObj)) {
                    if(this.el) this.el.remove()
                    return
                }

                 //Assign same context to this.context, so can have acces to props and attrs from setup function
                //  Object.assign(this.context, context)

             
                 this.root  = sNode.create(updateObj, context ,{parent:this, index:"root", node:this.root})
                
                  this.children = [this.root] 

                  //assign the same element as the root
                  this.el = this.root.el


                  if(this.parent) {
                    // debugger
                    //  this.parent.addChild(this.root.el,0)
                  }

                 this.pastObj = this.updateObj

                 return
            }
            //just a render function, no context
            else {

   
                updateObj = this.render(this.context)

                this.type = updateObj.type 
               
                // if(updateObj?.attrs?.caca) debugger
                

            }

        }
        
        // let children =   this.updateObj.children
    
        let pastObj =  this.pastObj
        //Filter if rerendering is necessary
        // children
        if(pastObj){

            // let pastChildren = pastObj?.children
            // let updateChildren = updateObj?.children

            // if(pastChildren && updateChildren && pastChildren.length != updateChildren.length){

            //     debugger
            // }

            // //last check, same component
            // if(pastObj?.type  === updateObj?.type) {
            //     this.pastObj = updateObj
            //     return updateObj
            // }


            // if( pastObj?.type  !== updateObj?.type ) {
            //     console.log(this.id, this)
            //     debugger
            //     //create a new node and replace it
            // }

        }

        this.updateTag({pastObj, updateObj})

        if(!this.el)debugger

        this.updateAttrs({pastObj, updateObj})

        this.updateChildren({pastObj, updateObj})

        this.el.sNode = this


        this.pastObj = updateObj

        return this

    }
   
    updateTag({pastObj, updateObj}){


        
        if(this.el && this.type === updateObj?.type) return
         //render component
        if(typeof this.type == "object") debugger

        //handle udpates
        if(pastObj){

            if(pastObj.type === updateObj.type) return

        }
        

    
    

        if(!updateObj) {
            this.node =  document.createTextNode("")
        }

        let objType = typeof updateObj



        //skip function, this may do some conflicts with the slots functions
        //or need to find a way to avoid function that a parent component has as slot.
        if(objType == "function") {

            debugger
            return this.el = document.createTextNode("")
            // updateObj = updateObj()
            // debugger
        }


        let comp  = this.type


        // let update = onlyUpdate({node, updateObj})
        
        if(pastObj?.el) {

            debugger

            return updateEl()
        }


        let children = updateObj?.children 
        // if(typeof comp == "object") return render(comp, updateObj )

        let type = typeof comp


        let doc =  window.document
        this.el = this?.pastObj?.el

        if(! this.el  && this.id)  {

            // this.el  = doc.querySelector(`[${this.uuid}]`)
        }


        if(! this.el  && comp)  {

            this.el   = doc.createElement(comp)
        }


        //textNode
        if(! this.el  && !children/**objType == "string" || objType == "number" */){
            this.el  = document.createTextNode(updateObj)
        }

        //create fragment
        let fragment
        if(!this.el && children) {
            debugger
            // fragment = document.createDocumentFragment();
            fragment = document.createElement("div")
        }

    

    }

    updateAttrs(params){

        let {updateObj , pastObj} = params


        
        let comp  = updateObj?.type
        let attrs =  updateObj?.attrs
    
        let el = this.el


        if(!el)debugger
       let currentListeners 

        if( attrs && el.setAttribute){
            //set attributes
            Object.keys(attrs).forEach(attr=> {
    
                let val = attrs[attr]
        
                

                if(el.getAttribute(attr) === val) return
    
                if(attr == "src") {
    
                    // console.log("updating", attr, el.getAttribute(attr), val)
            
                }
    
    
                //addEvent
                let event = attr.match(/on[A-Z].+/g)?.[0]
                if(event){
                    
                    
                    currentListeners = currentListeners || el.salListeners 

                    event = event.slice(2).toLowerCase()

                    if(currentListeners){

                            // let listeners = currentListeners?.[event]
                            // let strVal = val?.toString()
                            // //skip event that is equal
                            // //OR maybe remove because properties declared ,ay be differents....
                            // //  if(listeners.find(v=>v.listener.toString() == strVal)) return
                            // listeners.forEach(v=>{
                            //     if(v.listener.toString() == strVal) {
                        
                            //         el.removeEventListener(event, v.listener, v.options)
                                
                            //     }
                            // })
                            
                       }
    
                   
                    el.addEventListener(event, val, true)
                    return 
                }
    
                //this sets events also
                if(attr.slice(0,2) !== "on") {
        
                    el.setAttribute(attr, val)
    
                    //when setting input values, this is also needed, probebly with other properties too
                    try{
                        el[attr] =  val
                    }catch(err){
                        console.log(err)
                        debugger
                    }
            
                }
                else el[attr] =  val
                
                
            })
        }


        //handle node identification
        if(el && el.setAttribute){
        
            el.setAttribute(this.uuid, "" )  
            
            
            el.setAttribute("_"+this.index, "" )  
            el.setAttribute("data-id" , this.id )  
            el.setAttribute("data-key", this.updateObj?.key )  

        }
    
    }


    shouldRender(obj){
        return shouldRender(obj)

       

    }
    updateChildren(params){

        let {updateObj , pastObj} = params
    

        //parse the update obj and past object to make it work equal
        // this.parseUpdateObject(updateObj)


        let comp  = updateObj?.type
        let children = updateObj?.children 
  
    
        if(pastObj){

            if(typeof updateObj !== "object" && updateObj != this.pastObj) {

                this.el.textContent = updateObj
    
                if(typeof updateObj != "string" && typeof updateObj != "number" ){

                    debugger
                }
            
                
            }
            
        }

        if(typeof updateObj == "function"){

            debugger
        }
    
        //determine if should update the same el or create a new one
        //code
        let el = this.el
  

        if(!el) debugger


        //render children
        let rendered =[]
        if(children){
            //define the index manually so nested children can keep the pastObj
    
        
            if(!children.map) debugger
        
            let i= 0
            rendered =  children.filter(( child   )=>{
                let allowRender = this.renderChild({child, i, children, pastObj})
                //increment only when is rendered, if not when the i does not match it updates the nodes
                if(allowRender) i++
                return allowRender
            })
        
        }

         //remove past children
        if( this.pastObj){
            let newLength = rendered?.length || 0
            let current = this.el.childNodes.length
           
            while(current > newLength ){

                this.el.removeChild(this.el.lastChild);
                current = this.el.childNodes.length

            }
        }
   


    }
    

     
     renderChild({child, i , children, removeChildren}){
    

        if(!this.shouldRender(child)) return  
        //if is a function check
        if(child === this.pastObj?.children?.[i]) {

         
            if(typeof child == "function" )debugger
    
            return true
        }
      
     
    

        let childNode = child
      
        // if(child?.type?.name == "Button") debugger
        //filter the node

        if(isTextNode(child) ){

            if(this.el.childNodes[i] instanceof Text){
                this.el.childNodes[i].textContent = child
                return true
            }
            // if(!child) debugger
          
            try{
                this.el.insertBefore(document.createTextNode(child), this.el.childNodes[i] ?? null)
            }catch(err){
                debugger
            }
           

            return true
        }

        if(typeof child == "object"){
             childNode =  sNode.create(child, {   }, {parent:this, index:i})
        }



        
        



        // if(child?.type?.name == "Button") debugger

        if(child == "1") debugger
        // if(this?.type == "button") debugger

         this.addChild({childNode, i})

        return true
    
    
    }


    addChild({childNode, i}){
        
        if(!childNode) debugger


        if(!this.children.includes(childNode)){
            //add to the children in their actual position
            //this way on next child can check the node by this.children[i]
             this.children.splice(i, 0, childNode)

            childNode.parent = this
        }

        //get the root 
        let el = childNode.el
        if(!el && childNode.root) debugger
        
        if(el && el !== this.el.childNodes[i]){ 

            this.el.insertBefore(el, this.el.childNodes[i])

        }
    }

    parseUpdateObject(obj){
        if(obj?.children){
            obj.children = flatten(obj.children)
        }
    }
    
      


    

    renderComponentStyle(){
        //append style
        let style = this.component?.template
        if(style){
            let id = "style_" + this.component.name
                let el = document.querySelector(`#${this.component.name}`)
                if(!el){
                    el = document.createElement("style")
                
                    el.id = this.component.name

                    style = style.replace("<style>", "")
                    style = style.replace("</style>", "")
                    el.textContent = style
                    document.body.append(el)

                }
        }

    }
   

    generateContext( parentContext = {}, updateObj = {}){

        let comp = this.component


        let context = {
            ...parentContext,
            // ...updateObj,
            attrs:updateObj.attrs
        } || {}

        let props = {}
        context.props = props

        if(comp?.props){

            let propsDef = comp.props
    
            for(let prop in propsDef){
                    
                let val = context?.attrs?.[prop]

                // delete context.attrs[prop]

                //validate value....
                    //code

                //set value
                props[prop]  =  val       
                
            }

            // props = reactive(props)

        }


      

        let ctxChildren = updateObj?.children || []

        if(parentContext.children) debugger

        let children = []
        let slotsDef = comp?.slots || []
        let slots = {
            // default: (props)=>children.map(child=>{
            //     return render(child, null, props)
            // }),
            default: emptySlot,
            // (props)=>children,            
            ...slotsDef.reduce((o, name)=>Object.assign(o, {[name]:emptySlot}), {})

        }


        context.slots = slots


        // context.children = children

        if(ctxChildren){

            ctxChildren.forEach(child => {

                if(typeof child == "function" && slotsDef.includes(child.name)){
                    slots[child.name] = child
                    return 
                }

                if(child?.isSlot && slotsDef.includes(child.isSlot)) {
                    slots[child.isSlot] = ()=> child

                    return
                }

                //filters for child
                if(typeof child != "object" && typeof child != "function"){
                     //false childs like null or false
                    if(!child && child != 0) return
                    // empty strings
                    if(!/\S/.test(child)) return

                }
            
                children.push(child)
                
            });
        }

        if(children.length){
            slots.default = ()=>children
        }

    
        return context


    }

}



let cache = {

    
}
function createNode (compId, index,type, attrs, ...children){
    //this should create an object, that can be updateble by a sNode


    children =  flatten(children)
    return {index, key:attrs?.key?attrs.key:0,  id:index, type, attrs, children}

    

    if(cache?.[compId+index]?.key ){
        // let v = cache[compId+index]
        // let k = attrs.key
        // cache[compId+index].key = attrs.key
        // cache[compId+index].attrs.key = attrs.key
        // Object.assign(v, {key:k, index, type, attrs, children})
        // return v
        // return last.key = attrs.key
  
    }

    let v = {index, key:attrs?.key?attrs.key:0,  id:index, type, attrs, children}

    cache[compId+index] = v

    // index is the component index when rendering, that way can create a id by the position which allways be unique
    return v
        return sNode.create({type, attrs, ...children})

}

export  {

    createNode,
    render
}
export default {

    createNode,
    render
}