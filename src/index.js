const parts = import.meta.glob('./*.sal', { eager: true })



//console.log(components)
let ex = {}
for(let fileName in parts){

    let file = parts[fileName]
    let name = fileName.match(/([^/]+)(?=.sal)/g)[0]
    ex[name] =file?.default
    

}


export default ex

