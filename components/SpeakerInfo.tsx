'use client'

import React from 'react';

import { Color } from "chroma-js"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getDatabase, ref, child, onValue } from "firebase/database"
import { initializeApp } from "firebase/app"
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react'
import distinctColors from 'distinct-colors'
import CreatableSelect from 'react-select/creatable'

const useMount = (fun) => useEffect(fun, []);

type DbInfoEntry ={
  name : string;
  tags : Array<string>;
};

type SpeakerInfoData = {
  [key: string] : {name: string, tags: Set<string>, color: string};
};

type SpeakerInfoParams = {
  category : string;
  speakerKeys : Set<string>;
  videoId : string;
  speakerInfo: SpeakerInfoData;
  setSpeakerInfo: any;
};

type OptionType = {
  value : string;
  label : string;
};

const palette = distinctColors({ count: 45, lightMin: 70, chromaMax: 200 });

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD30a3gVbP-7PgTvTqCjW4xx-GlLMBQ5Ns",
  authDomain: "sps-by-the-numbers.firebaseapp.com",
  databaseURL: "https://sps-by-the-numbers-default-rtdb.firebaseio.com",
  projectId: "sps-by-the-numbers",
  storageBucket: "sps-by-the-numbers.appspot.com",
  messagingSenderId: "319988578351",
  appId: "1:319988578351:web:1caaadd0171003126deeda",
  measurementId: "G-WKM5FTSSLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
let appCheck;

export function getSpeakerAttributes(speaker : string, speakerInfo : SpeakerInfoData ) {
  const data = speakerInfo ? speakerInfo[speaker] : undefined;
  const name = data?.name || speaker;
  const tags = data?.tags || new Set<string>();

  const speakerNum = Number(speaker.split('_')[1]);
  const color = palette[speakerNum];

  return { name, color: color ? color.name() : 'grey', tags };
}

// speakerInfo has the name, tags, etc.
// speakerKeys is a list of speaker keys like SPEAKER_00
export default function SpeakerInfo({category, speakerKeys, videoId, speakerInfo, setSpeakerInfo} : SpeakerInfoParams) {
  const [existingNames, setExistingNames] = useState<object>({});
  const [existingTags, setExistingTags] = useState<Set<string>>(new Set<string>);
  const [authState, setAuthState] = useState<object>({});

  function handleNameChange(curSpeaker : string, selectedOption : OptionType) {
    const newSpeakerInfo = {...speakerInfo};
    const newName = selectedOption?.value;
    const info = newSpeakerInfo[curSpeaker] = newSpeakerInfo[curSpeaker] || {};
    if (newName && !existingNames.hasOwnProperty(newName)) {
      const newExistingNames = Object.assign({}, existingNames);
      newExistingNames[newName] = {recentTags: Array.from(info.tags)};
      // TODO: Extract all these isEquals() checks.
      if (!isEqual(existingNames, newExistingNames)) {
        setExistingNames(newExistingNames);
      }
    }

    if (newName !== info.name) {
      info.name = newName;
      // Autopopulate the recent tags if nothing else was there.
      if (!info.tags || info.tags.size === 0) {
        info.tags = new Set<string>(newExistingNames[newName].recentTags);
      }
      setSpeakerInfo(newSpeakerInfo);
    }

  }

  async function handleSignin() {
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);

      // The signed-in user info.
      const user = result.user;
      setAuthState({user, credential});

      // IdP data available using getAdditionalUserInfo(result)
      // ...

    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Signin failed", errorCode, errorMessage, email, credential);
    }
  }

  function handleTagsChange(curSpeaker, newTagOptions) {
    const newSpeakerInfo = {...speakerInfo};
    const newExistingTags = new Set<string>(existingTags);

    const info = newSpeakerInfo[curSpeaker] = newSpeakerInfo[curSpeaker] || {};
    const newTags = new Set<string>();
    for (const option of newTagOptions) {
      newTags.add(option.value);
      newExistingTags.add(option.value);
    }
    info.tags = newTags;
    setSpeakerInfo(newSpeakerInfo);

    if (!isEqual(existingTags, newExistingTags)) {
      setExistingTags(newExistingTags);
    }
  }

  async function handleSubmit(event) {
    const data = {
      auth: auth.currentUser ? await auth.currentUser.getIdToken(true) : "SpsSoSekure",
      category,
      videoId,
      speakerInfo: Object.fromEntries(
          Object.entries(speakerInfo).map(
            ([k,v], i) => [
              k,
              { name: v.name, tags: (v.tags ? Array.from(v.tags) : []) }
            ]))
    };

    fetch(
      'https://speakerinfo-rdcihhc4la-uw.a.run.app/sps-by-the-numbers/us-west1/speakerinfo',
      //'http://127.0.0.1:5001/sps-by-the-numbers/us-west1/speakerinfo',
      {
        method: "POST",
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  }

  // Load from the database.
  useMount(() => {
    let ignore = false;
    const database = getDatabase(app);
    const categoryRoot = ref(database, `transcripts/${category}`);
    const videoRef = child(categoryRoot, `v/${videoId}`);
    const existingRef = child(categoryRoot, 'existing');

    onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      if (!ignore && data && data.speakerInfo) {
        const newSpeakerInfo = Object.assign({}, speakerInfo);
        for (const [k,v] of Object.entries(data.speakerInfo)) {
          const entry = v as DbInfoEntry;
          const n = entry?.name;
          const t = entry?.tags;
          newSpeakerInfo[k] = newSpeakerInfo[k] || {};
          if (n && newSpeakerInfo[k].name === undefined) {
            newSpeakerInfo[k].name = n;
          }
          if (t && newSpeakerInfo[k].tags === undefined) {
            newSpeakerInfo[k].tags = new Set<string>(t);
          }
        }
        if (!isEqual(speakerInfo, newSpeakerInfo)) {
          setSpeakerInfo(newSpeakerInfo);
        }
      }
    });

    onValue(existingRef, (snapshot) => {
      const data = snapshot.val();
      if (!ignore && data) {
        if (!isEqual(existingNames, data.names)) {
          setExistingNames(Object.assign({}, existingNames, data.names));
        }

        const newTags = existingTags;
        Object.keys(data.tags).forEach(tag => newTags.add(tag));
        if (!isEqual(existingTags, newTags)) {
          setExistingTags(new Set<string>(Object.keys(data.tags)));
        }
      }
    });

    return () => { ignore = true; };
  });

  // Must be deleted once
  // https://github.com/JedWatson/react-select/issues/5459 is fixed.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Create all options.
  const allSpeakers : string[] = Array.from(speakerKeys).sort();
  const newExistingNames = Object.assign({}, existingNames);
  for (const s of allSpeakers) {
    const { name, tags } = getSpeakerAttributes(s, speakerInfo);
    if (name !== s) {
      newExistingNames[name] = {recentTags: Array.from(tags)};
    }
  }
  if (!isEqual(newExistingNames, existingNames)) {
    setExistingNames(newExistingNames);
  }

  const nameOptions : OptionType[] = [];
  for (const name of Object.keys(newExistingNames).sort()) {
    nameOptions.push({label: name, value: name});
  }

  const tagOptions : OptionType[] = [];
  for (const tag of Array.from(existingTags.keys()).sort()) {
    tagOptions.push({label: tag, value: tag});
  }

  // Create the speaker table.
  const speakerLabelInputs : React.ReactElement[] = [];
  let submitButton : React.ReactElement = (<></>);
  if (isMounted) {
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    if (!appCheck) {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LfukwApAAAAAOysCMfJontBc36O2vly91NWpip8'),

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        isTokenAutoRefreshEnabled: true
      });
    }

    for (const s of allSpeakers) {
      const { name, color, tags } = getSpeakerAttributes(s, speakerInfo);
      const curName = nameOptions.filter(v => v.label === name)?.[0];
      const curTags = tagOptions.filter(v => tags.has(v.label));
      speakerLabelInputs.push(
        <li key={`li-${s}`} className="py-1 flex" style={{backgroundColor: color}}>
          <div className="pl-2 pr-1 basis-1/2">
            <CreatableSelect
                id={`cs-name-${name}`}
                isClearable
                options={nameOptions}
                value={curName}
                placeholder={`Name for ${name}`}
                onChange={(newValue: OptionType) => handleNameChange(s, newValue)} />
          </div>
          <div className="pl-1 pr-2 basis-1/2">
            <CreatableSelect
                id={`cs-tag-${name}`}
                isClearable
                isMulti
                value={curTags}
                options={tagOptions}
                placeholder={`Tags for ${name}`}
                onChange={newValue => handleTagsChange(s, newValue)} />
          </div>
        </li>
      );
    }

    if (auth.currentUser) {
      submitButton = (
        <button key="submit-button"
          className="px-4 py-2 m-2 bg-red-500 rounded"
          onClick={handleSubmit}>
            Submit Changes as {auth.currentUser.email}
        </button>
      );
    } else {
      submitButton = (
        <button key="signin-button"
          className="px-4 py-2 m-2 bg-red-500 rounded"
          onClick={handleSignin}>
            Login To Submit
        </button>
      );
    }
  } else {
    speakerLabelInputs.push(<div key="loading-div">Wait...Loading Speakers Labels</div>);
  }

  return (
    <div style={{overflowY: "scroll", height: "40vh"}}>
      Speaker List
      <ul className="list-style-none">
        { speakerLabelInputs }
      </ul>
      {submitButton}
    </div>
  );
}
