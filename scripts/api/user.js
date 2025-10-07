const { wayzerApi, resourceSite, network } = require(modName + "/vars");

module.exports = function useUser(version, uuid){
    const userAgent = "Mindustry" + "/" + version + " " +"UUID" + "/" + uuid;
    let token = null;
    let info = null;

    return {
        /**
         * 
         * @param {Function} loginHandler 提示用户登录，参数为登录地址，回调函数在用户确认打开链接后调用
         * @param {Function} onFinish 登录结束调用
         */
        login(loginHandler, onFinish, onError){
            onFinish = onFinish || (_ => {});
            network.fetch(wayzerApi + "/users/tokenRequest", {
                method: Http.HttpMethod.POST,
                headers: getAuthHeaders()
            }).then(data => {
                const code = data.getResultAsString();
                const loginUrl = resourceSite + "/user/requestToken?code=" + code;
                loginHandler(loginUrl, () => {
                    network.fetch(wayzerApi + "/users/tokenRequest/" + code + "/result", {
                        timeout: 40 * 1000,
                        headers: getAuthHeaders(),
                    }).then(tokenResponse => {
                        token = tokenResponse.getResultAsString();
                        onFinish();
                    }).error(error => onError && onError(error));
                });
            }).error(error => onError && onError(error));
        },

        info(infoHandler, onError){
            if(info != null){
                infoHandler(info);
                return;
            }

            network.fetch(wayzerApi + "/users/info", {
                headers: getAuthHeaders(),
            }).then(data => {
                info = JSON.parse(data.getResultAsString());
                infoHandler(info);
            }).error(error => onError && onError(error));
        },

        postMap(map, onFinish, onError){
            network.fetch(wayzerApi + "/maps", {
                method: Http.HttpMethod.POST,
                content: map.file.read(),
                headers: Object.assign({
                    "Content-Type": "application/octet-stream",
                }, getAuthHeaders()),
            }).then(data => {
                const thread = parseInt(data.getResultAsString());
                onFinish && onFinish(thread);
            }).error(error => onError && onError(error));
        },

        deleteMap(thread, onFinish, onError){
            network.fetch(wayzerApi + "/maps/" + thread, {
                method: Http.HttpMethod.DELETE,
                headers: getAuthHeaders(),
            }).then(_ => onFinish && onFinish())
            .error(error => onError && onError(error));
        },

        listMap(onFinish, onError){
            onFinish = onFinish || (_ => {});
            onError = onError || (_ => {});
        }
    }

    function getAuthHeaders(){
        return {
            "Authorization": "Bearer " + (token || ""),
            "User-Agent": userAgent,
        }
    }
}