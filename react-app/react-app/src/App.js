import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig=({
  //API KEY 
})
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Empowering Survivors Forum</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
function SignIn() {

  const signInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      
      // You can use photoURL here or set it to state for later use
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className='initmsg'>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}


function SignOut() {
  if (auth.currentUser) {
    return <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>;
  } else {
    return null;
  }
}



function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();
  
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}


      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
