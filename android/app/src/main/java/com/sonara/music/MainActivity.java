package com.sonara.music;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        try {
            registerPlugin(SonaraNativeAudioPlugin.class);
        } catch (Throwable t) {
            Log.e(TAG, "Failed to register SonaraNativeAudioPlugin", t);
        }
        super.onCreate(savedInstanceState);
        enableBackgroundPlayback();
    }

    @Override
    public void onStart() {
        super.onStart();
        enableBackgroundPlayback();
    }

    @Override
    public void onResume() {
        super.onResume();
        enableBackgroundPlayback();
    }

    @Override
    public void onPause() {
        super.onPause();
        resumeWebViewTimers();
    }

    @Override
    public void onStop() {
        super.onStop();
        resumeWebViewTimers();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    private void resumeWebViewTimers() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                WebView webView = bridge.getWebView();
                webView.resumeTimers();
            }
        } catch (Throwable ignored) {}
    }

    private void enableBackgroundPlayback() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                WebView webView = bridge.getWebView();
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                webView.resumeTimers();
            }
        } catch (Throwable t) {
            Log.e(TAG, "Error enabling background playback settings", t);
        }
    }
}
