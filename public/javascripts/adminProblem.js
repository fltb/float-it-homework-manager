"use strict";

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

async function deleteProblem(id) {
    if (await checking("请问是否要删除 ID 为 " + id + " 的问题")) {
        let XHR = new XMLHttpRequest();

        let _data = {
            id: id
        };
        let data = JSON.stringify(_data);

        // 我们定义了数据成功发送时会发生的事。
        XHR.addEventListener("load", async function (event) {
            if (event.target.responseText === "success") {
                checking(`此问题(ID:${id})已经删除`);
            }
        });

        // 我们定义了失败的情形下会发生的事
        XHR.addEventListener("error", function (event) {
            checking(event.target.responseText);
        });

        // 我们设置了我们的请求
        XHR.open("POST", "/admin/problem/delete");

        XHR.setRequestHeader('Content-Type', 'application/json');

        // 发送的数据是由用户在表单中提供的
        XHR.send(data);
    }
}
