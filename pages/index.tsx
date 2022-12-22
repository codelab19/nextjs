import { diff } from 'deep-object-diff';
import QRCode from 'qrcode.react';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Snack, getSupportedSDKVersions, SDKVersion } from 'snack-sdk';
import Head from 'next/head';

import createWorkerTransport from '../components/transports/createWorkerTransport';
import { Button } from '../components/Button';
import { Toolbar } from '../components/Toolbar';
import defaults from '../components/Defaults';

const INITIAL_CODE_CHANGES_DELAY = 500;
const VERBOSE = !!process.browser;
const USE_WORKERS = true;

export default function Home() {
  const webPreviewRef = useRef(null);
  const [snack] = useState(
    () =>
      new Snack({
        ...defaults,
        disabled: !process.browser,
        codeChangesDelay: INITIAL_CODE_CHANGES_DELAY,
        verbose: VERBOSE,
        webPreviewRef: process.browser ? webPreviewRef : undefined,
        // Optionally you can run the transports inside a web-worker.
        // Encoding data messages for large apps might take several milliseconds
        // and can cause stutter when executed often.
        ...(USE_WORKERS ? { createTransport: createWorkerTransport } : {}),
      })
  );
  const [snackState, setSnackState] = useState(snack.getState());
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [codeChangesDelay, setCodeChangesDelay] = useState(INITIAL_CODE_CHANGES_DELAY);
  const [isClientReady, setClientReady] = useState(false);

  // Listen for state changes and log messages
  useEffect(() => {
    const listeners = [
      snack.addStateListener((state, prevState) => {
        console.log('State changed: ', diff(prevState, state));
        setSnackState(state);
      }),
      snack.addLogListener(({ message }) => console.log(message)),
    ];
    if (process.browser) {
      setClientReady(true);
    }
    return () => listeners.forEach((listener) => listener());
  }, [snack]);

  const {
    files,
    url,
    deviceId,
    online,
    onlineName,
    connectedClients,
    name,
    description,
    sdkVersion,
    webPreviewURL,
  } = snackState;

  return (
          <iframe
            ref={(c) => (webPreviewRef.current == c?.contentWindow ?? null)}
            src={isClientReady ? webPreviewURL : undefined}
            allow="geolocation; camera; microphone"
          />
  );
}

const sharedStyles = {
  pane: {
    border: '1px solid #DDDDE1',
    borderRadius: 4,
  },
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    paddingTop: 14,
  },
  left: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    marginLeft: 20,
  },
  preview: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 20,
    width: 240,
  },
  previewContainer: {
    flex: 1,
    ...sharedStyles.pane,
    position: 'relative',
    overflow: 'hidden',
  },
  previewFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    border: 0,
    backgroundColor: 'white',
  },
  previewNotSupported: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  code: {
    display: 'flex',
    flex: 1,
    ...sharedStyles.pane,
  },
  settingsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  settingsContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    ...sharedStyles.pane,
  },
  onlineContainer: {
    display: 'flex',
    flex: 1,
    marginTop: 20,
    flexDirection: 'column',
  },
  onlineContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    ...sharedStyles.pane,
  },
  qrcode: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  offline: {
    flex: 1,
    alignSelf: 'center',
    opacity: 0.5,
  },
  button: {
    marginRight: 10,
  },
});