import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { io } from 'socket.io-client'
import path from 'path'

const URL = 'https://www.bet365.gr'
const injectedJavaScript = `
(() => {
  const sendMessage = (data) => {
    window.ReactNativeWebView.postMessage(data)
  }

  let isFound = false

  XMLHttpRequest.prototype.openParent = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.sendParent = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (...params) {
      const [method, url] = params;
      if (url.includes('/placebet')) {
          isFound = true
      }
      this.openParent(...params);
  };

  XMLHttpRequest.prototype.send = function (...params) {
      if (isFound) {
          sendMessage(params[0])
          isFound = false
      }
      this.sendParent(...params);
  };
})()
`

const SOCKET_URL = 'http://localhost'

export const socket = io(SOCKET_URL);

export default function App() {

  const onMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;
    console.log('its data', data)
    // emit socket event
    socket.emit('NEW_BET', data)
  };

  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']}
        javaScriptEnabled={true}
        javaScriptEnabledAndroid={true}
        injectedJavaScript={injectedJavaScript}
        style={styles.webView}
        source={{ uri: URL }}
        onMessage={onMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  webView: {
    backgroundColor: '#fff',
    height: 360,
}
});
