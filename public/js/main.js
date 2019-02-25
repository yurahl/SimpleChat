let socket = io();

let messageInput = document.getElementById('message-input');
let messageBtn = document.getElementById('message-btn');
let messages = document.getElementById('messages');
messageBtn.onclick = function () {
    let text = messageInput.value;
    messageInput.value = '';
    socket.emit('message', {text});
};

socket.on('message', function (msg) {
    addMsg(msg);
});
socket.on('init', function (messages) {
    for(let massage of messages){
        addMsg(massage);
    }
});
function addMsg(msg) {
    let name = document.getElementsByClassName('name')[0].innerText;
    let singleMessage = document.createElement('div');
    if (msg.author.toString().toLowerCase() === name.toString().toLowerCase()){
        singleMessage.classList.add('message', 'message_my', 'clearfix');

    } else {
        singleMessage.classList.add('message', 'message_other', 'clearfix');
    }

    let spanFirst = document.createElement('span');
    let p = document.createElement('p');
    let spanSecond = document.createElement('span');

    spanFirst.innerText = `${msg.author}`;
    p.innerText =`${msg.text}`;
    spanSecond.innerText = `${msg.date}`;
    singleMessage.append(spanFirst);
    singleMessage.append(p);
    singleMessage.append(spanSecond);

    messages.appendChild(singleMessage);
}