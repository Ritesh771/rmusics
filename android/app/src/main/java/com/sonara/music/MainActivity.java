package com.sonara.music;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        enableBackgroundPlayback();
    }

    private void enableBackgroundPlayback() {
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings settings = webView.getSettings();
            // Allow media playback without gesture and ensure continuous audio
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}

