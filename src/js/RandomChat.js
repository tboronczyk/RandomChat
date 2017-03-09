function ChatLog(log) {
    "use strict";

    log = log || (function () {
        var d = document.createElement("div");
        d.className = "chat-log";
        return d;
    })();

    var write = function (msg, type) {
        var d = document.createElement("div");
        d.className = type;
        d.textContent = msg;
        log.appendChild(d);
    };

    var scroll = function () {
        log.scrollTop = log.scrollHeight;
    };

    this.log = function () {
        return log;
    };

    this.systemMessage = function (msg) {
        write(msg, "msg-sys");
        scroll();
    };

    this.userMessage = function (msg) {
        write(msg, "msg-user");
        scroll();
    };

    this.partnerMessage = function (msg) {
        write(msg, "msg-partner");
        scroll();
    };
}

function ChatInput(input) {
    "use strict";

    input = input || (function () {
        var d = document.createElement("div");
        d.className = "chat-input";
        return d;
    })();

    this.input = function () {
        return input;
    };

    this.clear = function () {
        input.textContent = "";
    };

    this.editable = function (bool) {
        input.setAttribute("contenteditable", bool);
    };

    this.enter = function (func) {
        input.addEventListener("keypress", function (e) {
            if (e.which === 13) {
                func(e);
            }
        });
    };

    this.focus = function () {
        input.focus();
    };

    this.text = function () {
        return input.textContent;
    };
}

function RandomChat(url, win) {
    "use strict";

    win = win || (function () {
        var d = document.createElement("div");
        d.className = "chat-window";
        return d;
    })();

    var log = new ChatLog();
    var input = new ChatInput();
    var socket = new WebSocket(url);

    win.appendChild(log.log());
    win.appendChild(input.input());

    this.window = function () {
        return win;
    };

    input.enter(function () {
        var msg = input.text();
        input.clear();
        log.userMessage(msg);
        socket.send(msg);
    });

    socket.onopen = function () {
        log.systemMessage(
            "Please wait while we search for a chat partner..."
        );
    };

    socket.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        switch (msg.event) {
        case "connected":
            log.systemMessage("Partner found! You may now chat.");
            input.editable(true);
            input.focus();
            break;
        case "message":
            log.partnerMessage(msg.text);
            break;
        case "disconnected":
            log.systemMessage(
                "Your chat partner disconnected. " +
                "Please wait while we search for a new partner..."
            );
            input.editable(false);
            break;
        }
    };

    socket.onclose = function (e) {
        if (e.code === 1000) {
            log.systemMessage("Connection closed. Goodbye!");
        } else {
            log.systemMessage(
                "Connection unavailable. (Error " + e.code + ")"
            );
        }
        input.editable(false);
    };
}
