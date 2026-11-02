package com.sonara.music;

import android.content.Context;
import android.os.Bundle;
import android.os.PowerManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SonaraNativeAudioPlugin.class);
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        enableBackgroundPlayback();
        acquireWakeLock();
    }

    private void requestNotificationPermission() {
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }
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
        acquireWakeLock();
    }

    @Override
    public void onPause() {
        super.onPause();
        // Crucial for continuous background audio: counteract Capacitor's webView.pauseTimers()
        // so JavaScript event loop, track completion handlers, MediaSession callbacks, and
        // next-song queue transitions remain fully active when the screen locks or app is in background.
        resumeWebViewTimers();
    }

    @Override
    public void onStop() {
        super.onStop();
        // Keep timers and network active while device screen is locked
        resumeWebViewTimers();
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        super.onDestroy();
    }

    private void resumeWebViewTimers() {
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            webView.resumeTimers();
        }
    }

    private void enableBackgroundPlayback() {
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings settings = webView.getSettings();
            // Allow media playback without user gesture and ensure continuous audio
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            webView.resumeTimers();
        }
    }

    private void acquireWakeLock() {
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Sonara:PlaybackWakeLock");
                    wakeLock.setReferenceCounted(false);
                }
            }
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
