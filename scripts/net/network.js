module.exports = {
    fetch: fetch,
}

function fetch(url){    
    let objCaller = {
        callbacks: [],
        errorHandler: null,
        data: {
            result: null,
            
            getResult(){
                return this.result;
            },
            
            getResultAsString(){
                return new java.lang.String(this.result, "UTF-8");
            },
        },
        
        error(callback){
            this.errorHandler = callback;
        },
    
        then(callback){
            this.callbacks.push(callback);
            return this;
        },
        
        callAll(){
            let {callbacks, data} = this;
            let result = data;
            callbacks.forEach((callback) => {
                result = callback(result);
            });
        },
    }
    
    Http.get(url, response => {
        objCaller.data.result = response.getResult(),
                
        // 抛回主线程
        Core.app.post(() => {
            objCaller.callAll();
        });
    }, error => {
        let {errorHandler} = objCaller;
        
        if(errorHandler != null){
            Core.app.post(() => {
                errorHandler(error);
            });
        }
    });
    
    return objCaller;
}