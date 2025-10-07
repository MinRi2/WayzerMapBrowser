module.exports = {
    fetch: fetch,
}

function fetch(url, options){    
    const { method, headers, content, timeout } = Object.assign({
        method: Http.HttpMethod.GET,
        headers: {},
        content: null,
        timeout: 2 * 1000,
    }, options || {});

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
            return this;
        },
    
        then(callback){
            this.callbacks.push(callback);
            return this;
        },
        
        _callAll(){
            let {callbacks, data} = this;
            let result = data;
            callbacks.forEach((callback) => {
                result = callback(result);
            });
        },
    }

    const request = Http.request(method, url);
    Object.keys(headers).forEach(key => {
        const value = headers[key];
        request.header(key, value);
    });

    if(content != null){
        request.content(content);
    }

    request.timeout = timeout;

    request.error(error => {
        let {errorHandler} = objCaller;
        
        if(errorHandler != null){
            Core.app.post(() => {
                errorHandler(error);
            });
        }
    });

    request.submit(response => {
        objCaller.data.result = response.getResult(),
                
        // 抛回主线程
        Core.app.post(() => {
            objCaller._callAll();
        });
    });
    
    return objCaller;
}