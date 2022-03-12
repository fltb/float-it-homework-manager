window.addEventListener("load", function () {
    /**
     * 
     * @param {Node} form 
     * @param {Node} notice 
     */
    function sendData(form, notice) {
        let XHR = new XMLHttpRequest();

        // 我们把这个 FormData 和表单元素绑定在一起。
        let _data = new FormData(form);
        
        let objData = {};
    
        _data.forEach((value, key) => objData[key] = value);
        
        let data = JSON.stringify(objData);

        // 我们定义了数据成功发送时会发生的事。
        XHR.addEventListener("load", function (event) {

            notice.textContent = event.target.responseText;
            if (event.target.responseText === "success") {
                const link = document.createElement("a");

                link.setAttribute('href', "/admin");
                link.textContent = '手动跳转';
                notice.textContent = "登录成功，正在跳转到管理页面，如果您的浏览器没有自动跳转，请";
                notice.appendChild(link);
                window.location.href = '/admin';
            }
        });

        // 我们定义了失败的情形下会发生的事
        XHR.addEventListener("error", function (event) {
            notice.textContent = event.target.responseText;
        });

        // 我们设置了我们的请求
        XHR.open("POST", "/admin/login");

        XHR.setRequestHeader('Content-Type', 'application/json');

        // 发送的数据是由用户在表单中提供的
        XHR.send(data);
    }

    let form = document.getElementById("my-form");

    // 接管表单的提交事件
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        let notice = document.querySelector(".notice");
        sendData(form, notice);
    });
});