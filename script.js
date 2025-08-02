const CLIENT_ID = ""; 
const API_KEY = "";
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById("content");
const channelForm = document.getElementById("channel-form");
const channelInput = document.getElementById("channel-input");
const videoContainer = document.getElementById("video-container");

const defaultChannel = "UCtKBgGqbVWkiPNTK1viTq0w";

let accessToken = '';

// GAPI client'ı yükleyip başlatıyoruz.
function gapiInit() {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  });
}

// Kullanıcının kimlik doğrulama yanıtını işler.
function handleCredentialResponse(response) {
  accessToken = response.getAuthResponse().id_token;
  gapi.client.setToken({ access_token: accessToken });
  updateSigninStatus(true);
}

// Kullanıcının oturum durumunu günceller.
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    content.style.display = "block";
    videoContainer.style.display = "block";
    getUserChannels();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
    content.style.display = "none";
    videoContainer.style.display = "none";
  }
}

// Kullanıcının kimlik doğrulamasını işler.
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Kullanıcının oturumunu kapatır.
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// Kullanıcının YouTube kanallarını getirir.
async function getUserChannels() {
  try {
    const response = await gapi.client.youtube.channels.list({
      part: 'snippet,contentDetails,statistics',
      mine: true
    });
    console.log(response);
  } catch (error) {
    console.error('Error fetching user channels:', error);
  }
}

// Sayfa yüklendiğinde kimlik doğrulama ve GAPI başlatma işlemleri.
window.onload = function () {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
    cancel_on_tap_outside: false,
    context: "signin",
    ux_mode: "popup",
    use_fedcm_for_prompt: true
  });
  
  google.accounts.id.renderButton(
    document.getElementById("authorize-button"),
    { theme: "outline", size: "large" }
  );

  gapiInit();
};

authorizeButton.onclick = handleAuthClick;
signoutButton.onclick = handleSignoutClick;

channelForm.onsubmit = function(event) {
  event.preventDefault();
  const channelName = channelInput.value;
  getUserChannels(channelName);
};

