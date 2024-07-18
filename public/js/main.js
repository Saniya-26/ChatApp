const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const usernames=document.getElementById('users');
const socket=io();

const { username, room}= Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

socket.emit('joinroom',{ username, room});

socket.on('roomusers', ({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})
socket.on('message',message =>{
    console.log(message);
    opMsg(message);
    //Ensures that the message visible is the most recent one(bottom one)
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', e=>{
    e.preventDefault();
    const msg=e.target.elements.msg.value;

    socket.emit('chatMessage',msg);

    //Clear input on typebar of chatroom
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();
});

function opMsg(message){
    const div =document.createElement('div');
    div.classList.add('message');
    //messge.text:since message is an object
    div.innerHTML=`<p class="meta">${message.username} ${message.time}<p class="text">${message.text}</p></p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//
function outputRoomName(room){
    roomName.innerText=room;
}

function outputUsers(users){
    usernames.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}

document.getElementById('leave-btn').addEventListener('click',()=>{
    const leave=confirm('Do you want to leave?');
    if(leave){
        window.location='../index.html';
    }
})