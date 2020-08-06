const socket = io("/");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connected:" + userId);
});

const userVideoDiv = document.getElementById("userVideo");
const myVideoDiv = document.getElementById("myVideo");

const myVideo = document.createElement("video");

myVideo.muted = true;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream, "user");
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, "remoteUser");
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

const addVideoStream = (video, stream, user) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  if (user === "remoteUser") {
    userVideoDiv.append(video);
  } else {
    myVideoDiv.append(video);
  }
};

const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, "remoteUser");
  });
  call.on("close", () => {
    console.log("close");
    video.remove();
  });
  peers[userId] = call;
};
