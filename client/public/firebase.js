import firebase from 'firebase';
const firebaseConfig = {
    apiKey: "AIzaSyA-da6pTw0V-AUbSmzumHuFqR4JfY_tbmE",
    authDomain: "blockchain-61394.firebaseapp.com",
    projectId: "blockchain-61394",
    storageBucket: "blockchain-61394.appspot.com",
    messagingSenderId: "545884967793",
    appId: "1:545884967793:web:1d682060692778c7fa9cd0",
    measurementId: "G-8CTWXN2FXG"
  };
firebase.initializeApp(firebaseConfig);
var storage = firebase.storage();
export default storage;