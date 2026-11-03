package com.sonara.music;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
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
        setupEdgeToEdgeAndStatusBar();
        enableBackgroundPlayback();
    }

    private void setupEdgeToEdgeAndStatusBar() {
        try {
            // Apply top padding equal to status bar height so web content NEVER collides with the system status bar
            View contentView = findViewById(android.R.id.content);
            if (contentView != null) {
                ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                    Insets statusInsets = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars());
                    v.setPadding(0, statusInsets.top, 0, 0);
                    return windowInsets;
                });
            }

            // Match Sonara dark theme background for status bar
            getWindow().setStatusBarColor(Color.parseColor("#0d0b14"));
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            if (controller != null) {
                // White text and icons on the dark status bar
                controller.setAppearanceLightStatusBars(false);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Error configuring status bar insets", t);
        }
    }

    @Override
    protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
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
