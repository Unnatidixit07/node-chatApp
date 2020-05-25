const socket = io()

const $formData=document.querySelector('#message-form')
const $formInputData=document.querySelector('input')
const $formButton=document.querySelector('button')
const $messages=document.querySelector('#messages')



const $template=document.querySelector('#message-template').innerHTML
const $template2=document.querySelector('#location-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}= Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll=()=>{
const $newMsg=$messages.lastElementChild

const msgStyle= getComputedStyle($newMsg)
const newMsgMargin= parseInt(msgStyle.marginBottom)
const newMsgHeight = $newMsg.offsetHeight+ newMsgMargin

const visibleHeight= $messages.offsetHeight

const containerHeight= $messages.scrollHeight
const scrollOffset= $messages.scrollTop + visibleHeight

if(containerHeight - newMsgHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
}
}

socket.on('message', (message) => {
    console.log(message)
    const html= Mustache.render($template,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location)=>{
    const html=Mustache.render($template2,{
        username:location.username,
        url:location.url,
        createdAt:moment(location.createdAt).format('h:mm a ')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$formData.addEventListener('submit', (e) => {
    e.preventDefault()

    $formButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(error)=>{
        $formButton.removeAttribute('disabled')
        $formInputData.value=' '
        $formInputData.focus()

        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

const $locationButton=document.querySelector('#send-location')

$locationButton.addEventListener('click', () => {
    $locationButton.setAttribute('disabled','disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    
    
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join',{username ,room}, (error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})