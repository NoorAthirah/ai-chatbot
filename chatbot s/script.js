const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot= document.querySelector("#close-chatbot");

//API Setup
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type:null
    }
}

const chatHistory = []
const initialInputHeight = messageInput.scrollHeight;

//Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message",... classes);
    div.innerHTML = content;
    return div;
}

//Generate Bot response using API
const generateBotResponse= async(incomingMessageDiv) =>{
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    //Add user response to chat history
    chatHistory.push({
        role: "user", 
        parts: [{ text: userData.message}, ...(userData.file.data ? [{inline_data:userData.file }]:
                     [])]
    });
    //API request option
    const requestOptions ={
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({
            contents: chatHistory
        })
    }
    try{
        //Fetch Bot from API
        const response = await fetch(API_URL, requestOptions);
        const data= await response.json();
        if(!response.ok) throw new Error(data.error.message);
        
        
        // Extract and display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;


        //Add bot response to chat history
        chatHistory.push({
        role: "model", 
        parts: [{ text: apiResponseText}]
    });


    } catch(error){
        console.log(error)
        messageElement.innerText=error.message;
        messageElement.style.color ="rgb(197, 26, 26)";

    }
    finally{
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({top:chatBody.scrollHeight, behavior:"smooth"}) //auto scrolling
    }

}

//Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault(); //prevent from submitting    
    userData.message = messageInput.value.trim();
    messageInput.value = ""; //clear text area after message is sent
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));  

    //Create and display user message   
    const messageContent = `
    <div class="message-text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" style="max-width: 200px; margin-top: 8px;" />`
    : ""}`;

    const outGoingMessageDiv = createMessageElement(messageContent, "user-message");    
    outGoingMessageDiv.querySelector(".message-text").textContent =  userData.message;
    chatBody.appendChild(outGoingMessageDiv);
    chatBody.scrollTo({top:chatBody.scrollHeight, behavior:"smooth"}) //auto scrolling  

    

   //Simulate bot response with a delay (thinking)
    setTimeout(() => {
        const messageContent = ` <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                    <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                    </svg>
                        
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        
        //incomingMessageDiv.querySelector(".message-text").textContent =  userData.message;
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top:chatBody.scrollHeight, behavior:"smooth"}) //auto scrolling

        generateBotResponse(incomingMessageDiv);
        }, 600);
    }   


//Handle Enter key press when sending message
messageInput.addEventListener("keydown", (e)=> {
    const userMessage = e.target.value.trim();//trim to remove whitespace    
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768 ){
        handleOutgoingMessage(e);
    }
});

//Adust input field height dynamically
messageInput.addEventListener("input", () => {
    messageInput.style.height=`${initialInputHeight}px`;
    messageInput.style.height=`${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > 
    initialInputHeight ? "15px": "32px";

});


//Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) =>{
    fileUploadWrapper.querySelector("img").src = e.target.result;
    //  reader.onload = (e) => {
         const previewImg = fileUploadWrapper.querySelector("img");
        // previewImg.src = e.target.result;
        previewImg.style.display = "block"; // Make sure it's visible

    fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];

        //Store file data in userData
        userData.file = {
        data: base64String,
        mime_type:file.type 
    };
    

        fileInput.value = "";
    };
    reader.readAsDataURL(file);
});

//Cancel file upload
fileCancelButton.addEventListener("click", ()=>{
    userData.file = null;
    
    fileUploadWrapper.classList.remove("file-uploaded");
});




//Initialize emoji pickekr
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none", 
    previewPosition: "none", 
    onEmojiSelect : (emoji)=>{
        const {selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) =>{
        if (e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        }else{
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector('#file-upload').addEventListener("click" , () => fileInput.click()); //trigger file input when file uplaod button is clicked
chatbotToggler.addEventListener("click", () => document.body.classList.toggle
("show-chatbot"));
closeChatbot.addEventListener("click", () =>document.body.classList.remove
("show-chatbot"));
