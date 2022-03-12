function checking(infos) {
    if (infos) {
        document.querySelector(".check .notice").textContent = infos;
    }
    return new Promise(function (res, rej) {
        function showCheckDiv() {
            const blackOverlay = document.querySelector(".black-overlay");
            const check = document.querySelector(".check");
        
            blackOverlay.removeAttribute("class", "disable");
            check.removeAttribute("class", "disable");
            blackOverlay.setAttribute("class", "black-overlay");
            check.setAttribute("class", "check");
        }
        
        function closeDiv() {
            const blackOverlay = document.querySelector(".black-overlay");
            const check = document.querySelector(".check");
        
            blackOverlay.setAttribute("class", "black-overlay disable");
            check.setAttribute("class", "check disable");
            res(false);
        }

        function ok() {
            const blackOverlay = document.querySelector(".black-overlay");
            const check = document.querySelector(".check");
        
            blackOverlay.setAttribute("class", "black-overlay disable");
            check.setAttribute("class", "check disable");
            res(true);
        }
        showCheckDiv();
        document.querySelector(".cancel-button").addEventListener("click", closeDiv);
        document.querySelector(".black-overlay").addEventListener("click", closeDiv);
        document.querySelector(".ok-button").addEventListener("click", ok);
    })
}

async function deleteUser(id) {
    if (await checking("请问是否要删除 ID 为 " + id + " 的用户")) {
        let XHR = new XMLHttpRequest();

        let _data = {
            id: id
        };
        
        let objData = {};
    
        _data.forEach((value, key) => objData[key] = value);
        
        let data = JSON.stringify(objData);

        // 我们定义了数据成功发送时会发生的事。
        XHR.addEventListener("load",async function (event) {

            notice.textContent = event.target.responseText;
            if (event.target.responseText === "success") {
                await checking("用户已经删除");
            }
        });

        // 我们定义了失败的情形下会发生的事
        XHR.addEventListener("error", function (event) {
            await checking(event.target.responseText);
        });

        // 我们设置了我们的请求
        XHR.open("POST", "/admin/user/delete");

        XHR.setRequestHeader('Content-Type', 'application/json');

        // 发送的数据是由用户在表单中提供的
        XHR.send(data);
    }
}