"use strict";

function sleep(time) {
    return new Promise(function (res, rej) {
        setTimeout(res(), time);
    })
}

function checking(infos) {
    const WINDOW = "check", OVERLAY = "black-overlay",
        OK = ".check .ok-button", CANCEL = ".check .cancel-button",
        NOTICE = ".check .notice";
    if (infos) {
        document.querySelector(NOTICE).textContent = infos;
    }
    return new Promise(function (res, rej) {

        function showCheckDiv() {
            const blackOverlay = document.querySelector("." + OVERLAY);
            const check = document.querySelector("." + WINDOW);

            blackOverlay.setAttribute("class", OVERLAY);
            check.setAttribute("class", WINDOW);
            addAllListener();
        }

        function closeDiv() {
            const blackOverlay = document.querySelector("." + OVERLAY);
            const check = document.querySelector("." + WINDOW);

            blackOverlay.setAttribute("class", OVERLAY + " disable");
            check.setAttribute("class", WINDOW + " disable");
            removeAllListener();
        }

        function close() {
            closeDiv();
            res(false);
        }

        function ok() {
            closeDiv();
            res(true);
        }

        function removeAllListener() {
            document.querySelector(OK).removeEventListener("click", ok);
            document.querySelector("." + OVERLAY).removeEventListener("click", close);
            document.querySelector(CANCEL).removeEventListener("click", close);
        }

        function addAllListener() {
            document.querySelector(OK).addEventListener("click", ok);
            document.querySelector("." + OVERLAY).addEventListener("click", close);
            document.querySelector(CANCEL).addEventListener("click", close);
        }

        showCheckDiv();
    });
}

async function deleteUser(id) {
    if (await checking("请问是否要删除 ID 为 " + id + " 的用户")) {
        let XHR = new XMLHttpRequest();

        let _data = {
            id: id
        };
        let data = JSON.stringify(_data);

        // 我们定义了数据成功发送时会发生的事。
        XHR.addEventListener("load", async function (event) {
            if (event.target.responseText === "success") {
                checking("用户已经删除");
            }
        });

        // 我们定义了失败的情形下会发生的事
        XHR.addEventListener("error", function (event) {
            checking(event.target.responseText);
        });

        // 我们设置了我们的请求
        XHR.open("POST", "/admin/user/delete");

        XHR.setRequestHeader('Content-Type', 'application/json');

        // 发送的数据是由用户在表单中提供的
        XHR.send(data);
    }
}

async function modifyUser(id) {
    const WINDOW = "modify-form", OVERLAY = "black-overlay",
        OK = ".modify-form .submit-button", CANCEL = ".modify-form .cancel-button";

    function modify() {
        return new Promise(function (res, rej) {

            function showCheckDiv() {
                const blackOverlay = document.querySelector("." + OVERLAY);
                const check = document.querySelector("." + WINDOW);

                fetch('/admin/user/infos?id=' + id)
                    .then(ress => { return ress.json() })
                    .then(data => {
                        const inputs = document.querySelectorAll("." + WINDOW + " input");

                        inputs.forEach(function (input) {
                            const name = input.getAttribute("name");
                            if (name in data) {
                                input.value = data[name];
                            }
                        });

                        blackOverlay.setAttribute("class", OVERLAY);
                        check.setAttribute("class", WINDOW);
                        addAllListener();
                    })
            }

            function closeDiv() {
                const blackOverlay = document.querySelector("." + OVERLAY);
                const check = document.querySelector("." + WINDOW);

                const inputs = document.querySelectorAll("." + WINDOW + " input");

                inputs.forEach(function (input) {
                    input.value = "";
                });

                blackOverlay.setAttribute("class", OVERLAY + " disable");
                check.setAttribute("class", WINDOW + " disable");
                removeAllListener();
            }

            function close() {
                closeDiv();
                res(false);
            }

            function ok() {
                // 我们把这个 FormData 和表单元素绑定在一起。
                let _data = new FormData(document.querySelector('.' + WINDOW));
                let objData = {};
                _data.forEach((value, key) => objData[key] = value);
                objData.id = id;
                let data = JSON.stringify(objData);

                closeDiv();
                res(data);
            }

            function removeAllListener() {
                document.querySelector(OK).removeEventListener("click", ok);
                document.querySelector("." + OVERLAY).removeEventListener("click", close);
                document.querySelector(CANCEL).removeEventListener("click", close);
            }

            function addAllListener() {
                document.querySelector(OK).addEventListener("click", ok);
                document.querySelector("." + OVERLAY).addEventListener("click", close);
                document.querySelector(CANCEL).addEventListener("click", close);
            }

            showCheckDiv();
        });
    }


    const infos = await modify();
    if (!infos) {
        return;
    }

    let XHR = new XMLHttpRequest();

    // 我们定义了数据成功发送时会发生的事。
    XHR.addEventListener("load", async function (event) {
        if (event.target.responseText === "success") {
            checking("用户修改成功");
        }
    });

    // 我们定义了失败的情形下会发生的事
    XHR.addEventListener("error", function (event) {
        checking(event.target.responseText);
    });

    // 我们设置了我们的请求
    XHR.open("POST", "/admin/user/modify");

    XHR.setRequestHeader('Content-Type', 'application/json');

    // 发送的数据是由用户在表单中提供的
    XHR.send(infos);
}
