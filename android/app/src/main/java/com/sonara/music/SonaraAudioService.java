package com.sonara.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.OptIn;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.exoplayer.DefaultLoadControl;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.exoplayer.upstream.DefaultLoadErrorHandlingPolicy;
import androidx.media3.session.DefaultMediaNotificationProvider;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class SonaraAudioService extends MediaSessionService {
    public static final String TAG = "SonaraAudio";
    public static final String CHANNEL_ID = "sonara_music_playback";
    public static final String DEFAULT_CHANNEL_ID = "default_channel_id";

    public static class TrackItem {
        public String id;
        public String title;
        public String artist;
        public String album;
        public String audioUrl;
        public String artworkUrl;
        public double duration;

        public TrackItem(String id, String title, String artist, String album, String audioUrl, String artworkUrl, double duration) {
            this.id = id != null ? id : "";
            this.title = title != null ? title : "Unknown Title";
            this.artist = artist != null ? artist : "Unknown Artist";
            this.album = album != null ? album : "Sonara Music";
            this.audioUrl = audioUrl != null ? audioUrl : "";
            this.artworkUrl = artworkUrl != null ? artworkUrl : "";
            this.duration = duration;
        }
    }

    public interface ServiceListener {
        void onTrackTransition(int index, TrackItem track);
        void onPlaybackStateChanged(boolean isPlaying);
        void onProgressUpdated(double position, double duration);
        void onError(String message);
    }

    private static volatile SonaraAudioService instance;

    public static SonaraAudioService getInstance() {
        return instance;
    }

    private final IBinder binder = new LocalBinder();
    private ExoPlayer player;
    private MediaSession mediaSession;
    private final List<TrackItem> queue = new ArrayList<>();
    private String repeatMode = "off"; // "off", "all", "one"
    private boolean isShuffle = false;
    private ServiceListener listener;
    private final Handler progressHandler = new Handler(Looper.getMainLooper());
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private boolean isProgressRunning = false;
    private int networkRetryCount = 0;
    private static final int MAX_NETWORK_RETRIES = 5;
    private Runnable pendingRecoveryRunnable = null;
    private boolean isNetworkConnected = true;
    private ConnectivityManager.NetworkCallback networkCallback = null;
    private int pendingRecoveryIndex = -1;
    private long pendingRecoveryPositionMs = -1;
    private boolean isAwaitingNetwork = false;
    private final Random random = new Random();
    private android.net.wifi.WifiManager.WifiLock wifiLock = null;
    private long lastRecoverySuccessTimestamp = 0;

    private void cancelPendingRecovery() {
        if (pendingRecoveryRunnable != null) {
            mainHandler.removeCallbacks(pendingRecoveryRunnable);
            pendingRecoveryRunnable = null;
            Log.i(TAG, "[PlaybackRecovery] Cancelled pending recovery operation");
        }
        isAwaitingNetwork = false;
    }

    private void executeRecovery(int targetIndex, long targetPosition) {
        cancelPendingRecovery();
        if (player == null || targetIndex < 0 || targetIndex >= queue.size()) {
            Log.w(TAG, "[PlaybackRecovery] Invalid recovery target: index=" + targetIndex + " queueSize=" + queue.size());
            return;
        }

        boolean shouldPlay = player.getPlayWhenReady();
        Log.i(TAG, "[PlaybackRecovery] retry execution: seekTo(" + targetIndex + ", " + targetPosition + "ms), prepare(), playWhenReady=" + shouldPlay);
        player.seekTo(targetIndex, targetPosition);
        player.prepare();
        if (shouldPlay) {
            player.play();
        }
    }

    private void initConnectivityMonitoring() {
        try {
            // Configure JVM DNS cache TTL to 24 hours so resolved IPs stay in memory across track transitions
            java.security.Security.setProperty("networkaddress.cache.ttl", "86400");
            java.security.Security.setProperty("networkaddress.cache.negative.ttl", "0");

            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                Network activeNet = cm.getActiveNetwork();
                NetworkCapabilities caps = activeNet != null ? cm.getNetworkCapabilities(activeNet) : null;
                isNetworkConnected = (caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET));
                Log.i(TAG, "[NetworkStatus] Initial network state: " + (isNetworkConnected ? "Available" : "Unavailable"));

                NetworkRequest request = new NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build();

                networkCallback = new ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(@NonNull Network network) {
                        runOnMain(() -> {
                            isNetworkConnected = true;
                            Log.i(TAG, "[NetworkStatus] Available on " + network);
                            if (isAwaitingNetwork && pendingRecoveryIndex >= 0) {
                                Log.i(TAG, "[PlaybackRecovery] Network restored! Resuming recovery for index " + pendingRecoveryIndex);
                                executeRecovery(pendingRecoveryIndex, pendingRecoveryPositionMs);
                            }
                        });
                    }

                    @Override
                    public void onLost(@NonNull Network network) {
                        runOnMain(() -> {
                            isNetworkConnected = false;
                            Log.w(TAG, "[NetworkStatus] Lost network " + network);
                        });
                    }
                };

                cm.registerNetworkCallback(request, networkCallback);
            }
        } catch (Throwable t) {
            Log.e(TAG, "[SonaraAudioService] Error setting up connectivity monitoring", t);
        }
    }

    private void runOnMain(Runnable r) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            r.run();
        } else {
            mainHandler.post(r);
        }
    }

    public class LocalBinder extends Binder {
        public SonaraAudioService getService() {
            return SonaraAudioService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        Log.i(TAG, "[SonaraAudioService] onCreate: Initializing service and ExoPlayer MediaSession");
        try {
            android.net.wifi.WifiManager wm = (android.net.wifi.WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                wifiLock = wm.createWifiLock(android.net.wifi.WifiManager.WIFI_MODE_FULL_HIGH_PERF, "Sonara:WifiLock");
                wifiLock.setReferenceCounted(false);
                wifiLock.acquire();
                Log.i(TAG, "[WifiLock] Acquired WIFI_MODE_FULL_HIGH_PERF");
            }
        } catch (Throwable t) {
            Log.w(TAG, "[WifiLock] Could not acquire WifiLock", t);
        }
        try {
            initConnectivityMonitoring();
            createNotificationChannels();
            initNotificationProvider();
            initExoPlayer();
        } catch (Throwable t) {
            Log.e(TAG, "[SonaraAudioService] Fatal error initializing ExoPlayer or MediaSession", t);
        }
    }

    @OptIn(markerClass = UnstableApi.class)
    private void initNotificationProvider() {
        try {
            DefaultMediaNotificationProvider provider = new DefaultMediaNotificationProvider.Builder(this)
                .setChannelId(CHANNEL_ID)
                .build();
            provider.setSmallIcon(R.drawable.ic_notification);
            setMediaNotificationProvider(provider);
            Log.i(TAG, "[SonaraAudioService] Configured DefaultMediaNotificationProvider with ic_notification");
        } catch (Throwable t) {
            Log.e(TAG, "[SonaraAudioService] Error setting notification provider", t);
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Sonara Music Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background audio playback and lock-screen controls");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(channel);

            NotificationChannel defaultChannel = new NotificationChannel(
                DEFAULT_CHANNEL_ID,
                "Sonara Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            defaultChannel.setDescription("Sonara media playback notification");
            defaultChannel.setShowBadge(false);
            defaultChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(defaultChannel);

            Log.i(TAG, "[SonaraAudioService] Notification channels created successfully: " + CHANNEL_ID + ", " + DEFAULT_CHANNEL_ID);
        }
    }

    @OptIn(markerClass = UnstableApi.class)
    private void initExoPlayer() {
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build();

        androidx.media3.datasource.DefaultHttpDataSource.Factory httpDataSourceFactory =
            new androidx.media3.datasource.DefaultHttpDataSource.Factory()
                .setUserAgent("Sonara/1.0 (Linux; Android " + Build.VERSION.RELEASE + ")")
                .setConnectTimeoutMs(30000)
                .setReadTimeoutMs(30000)
                .setAllowCrossProtocolRedirects(true);

        androidx.media3.datasource.DefaultDataSource.Factory dataSourceFactory =
            new androidx.media3.datasource.DefaultDataSource.Factory(this, httpDataSourceFactory);

        DefaultLoadErrorHandlingPolicy loadErrorHandlingPolicy = new DefaultLoadErrorHandlingPolicy(8);

        DefaultMediaSourceFactory mediaSourceFactory =
            new DefaultMediaSourceFactory(dataSourceFactory)
                .setLoadErrorHandlingPolicy(loadErrorHandlingPolicy);

        DefaultLoadControl loadControl = new DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                60000,   // minBufferMs (60s)
                600000,  // maxBufferMs (600s = 10 minutes: buffers complete audio file)
                2000,    // bufferForPlaybackMs
                5000     // bufferForPlaybackAfterRebufferMs
            )
            .setTargetBufferBytes(64 * 1024 * 1024) // 64MB allows whole track to buffer upfront in memory
            .setBackBuffer(30000, true)
            .setPrioritizeTimeOverSizeThresholds(true)
            .build();

        player = new ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
            .setLoadControl(loadControl)
            .setAudioAttributes(audioAttributes, true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build();

        Log.i(TAG, "[initExoPlayer] Player initialized. appLooper=" + player.getApplicationLooper().getThread().getName()
            + " currentLooper=" + (Looper.myLooper() != null ? Looper.myLooper().getThread().getName() : "null")
            + " wakeMode=WAKE_MODE_NETWORK");

        player.addListener(new Player.Listener() {
            @Override
            public void onMediaItemTransition(@Nullable MediaItem mediaItem, int reason) {
                int index = player != null ? player.getCurrentMediaItemIndex() : -1;
                TrackItem track = (index >= 0 && index < queue.size()) ? queue.get(index) : null;
                String trackTitle = track != null ? track.title : (mediaItem != null && mediaItem.mediaMetadata.title != null ? mediaItem.mediaMetadata.title.toString() : "Unknown");
                String uri = track != null ? track.audioUrl : (mediaItem != null && mediaItem.localConfiguration != null ? mediaItem.localConfiguration.uri.toString() : "");
                String reasonStr = (reason == Player.MEDIA_ITEM_TRANSITION_REASON_AUTO) ? "AUTO" :
                                   (reason == Player.MEDIA_ITEM_TRANSITION_REASON_SEEK) ? "SEEK" :
                                   (reason == Player.MEDIA_ITEM_TRANSITION_REASON_REPEAT) ? "REPEAT" : "PLAYLIST_CHANGED";
                Log.i(TAG, "[MediaItemTransition] reason=" + reasonStr + " (" + reason + ") index=" + index + " title=\"" + trackTitle + "\" uri=" + uri
                    + " isPlaying=" + (player != null && player.isPlaying()) + " playWhenReady=" + (player != null && player.getPlayWhenReady()));
                if (listener != null && track != null) {
                    listener.onTrackTransition(index, track);
                }
            }

            @Override
            public void onIsLoadingChanged(boolean isLoading) {
                long bufferedPos = player != null ? player.getBufferedPosition() : -1;
                long totalDur = player != null ? player.getDuration() : -1;
                int bufferedPercentage = player != null ? player.getBufferedPercentage() : -1;
                Log.i(TAG, "[onIsLoadingChanged] isLoading=" + isLoading
                    + " bufferedPos=" + (bufferedPos / 1000.0) + "s / " + (totalDur / 1000.0) + "s (" + bufferedPercentage + "%)"
                    + " currentIndex=" + getCurrentIndex());
            }

            @Override
            public void onAudioAttributesChanged(AudioAttributes audioAttributes) {
                Log.i(TAG, "[onAudioAttributesChanged] contentType=" + audioAttributes.contentType
                    + " usage=" + audioAttributes.usage
                    + " flags=" + audioAttributes.flags);
            }

            @Override
            public void onTracksChanged(androidx.media3.common.Tracks tracks) {
                Log.i(TAG, "[onTracksChanged] Track groups count: " + tracks.getGroups().size()
                    + " hasTracks=" + (!tracks.getGroups().isEmpty()));
            }

            @Override
            public void onPlaybackStateChanged(int state) {
                String stateStr = (state == Player.STATE_IDLE) ? "STATE_IDLE" :
                                  (state == Player.STATE_BUFFERING) ? "STATE_BUFFERING" :
                                  (state == Player.STATE_READY) ? "STATE_READY" : "STATE_ENDED";
                long bufferedPos = player != null ? player.getBufferedPosition() : -1;
                int bufferedPercentage = player != null ? player.getBufferedPercentage() : -1;
                Log.i(TAG, "[PlaybackState] " + stateStr + " (pos: " + getCurrentPosition() + "s, dur: " + getDuration() + "s"
                    + ", buffered: " + (bufferedPos / 1000.0) + "s [" + bufferedPercentage + "%]"
                    + ", isPlaying: " + (player != null && player.isPlaying())
                    + ", isLoading: " + (player != null && player.isLoading())
                    + ", playWhenReady: " + (player != null && player.getPlayWhenReady())
                    + ", suppression: " + (player != null ? player.getPlaybackSuppressionReason() : -1) + ")");
                switch (state) {
                    case Player.STATE_IDLE:
                        break;
                    case Player.STATE_BUFFERING:
                        break;
                    case Player.STATE_READY:
                        networkRetryCount = 0;
                        if (player != null && player.getPlayWhenReady()) {
                            lastRecoverySuccessTimestamp = System.currentTimeMillis();
                            startProgressTracking();
                        }
                        break;
                    case Player.STATE_ENDED:
                        Log.i(TAG, "[PlaybackState] Track natural end reached. currentIndex: " + getCurrentIndex() + ", repeatMode: " + repeatMode);
                        // REPEAT_MODE_ALL is set on the player, so ENDED only happens with repeat off.
                        if (listener != null) {
                            listener.onPlaybackStateChanged(false);
                        }
                        break;
                }
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                Log.i(TAG, "[onIsPlayingChanged] isPlaying=" + isPlaying + " (index: " + getCurrentIndex()
                    + ", pos: " + getCurrentPosition() + "s, playWhenReady=" + (player != null && player.getPlayWhenReady())
                    + ", suppression=" + (player != null ? player.getPlaybackSuppressionReason() : -1) + ")");
                if (isPlaying) {
                    startProgressTracking();
                } else {
                    stopProgressTracking();
                }
            }

            @Override
            public void onPlayWhenReadyChanged(boolean playWhenReady, int reason) {
                String reasonStr = (reason == Player.PLAY_WHEN_READY_CHANGE_REASON_USER_REQUEST) ? "USER_REQUEST" :
                                   (reason == Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_FOCUS_LOSS) ? "AUDIO_FOCUS_LOSS" :
                                   (reason == Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_BECOMING_NOISY) ? "AUDIO_BECOMING_NOISY" :
                                   (reason == Player.PLAY_WHEN_READY_CHANGE_REASON_REMOTE) ? "REMOTE" : "END_OF_MEDIA_ITEM";
                Log.i(TAG, "[onPlayWhenReadyChanged] playWhenReady=" + playWhenReady + " reason=" + reasonStr + " (" + reason + ")");
                if (listener != null) {
                    listener.onPlaybackStateChanged(playWhenReady);
                }
            }

            @Override
            public void onPlaybackSuppressionReasonChanged(int suppressionReason) {
                String reasonStr = (suppressionReason == Player.PLAYBACK_SUPPRESSION_REASON_NONE) ? "NONE" :
                                   (suppressionReason == Player.PLAYBACK_SUPPRESSION_REASON_TRANSIENT_AUDIO_FOCUS_LOSS) ? "TRANSIENT_AUDIO_FOCUS_LOSS" :
                                   "UNSUITABLE_AUDIO_OUTPUT";
                Log.w(TAG, "[onPlaybackSuppressionReasonChanged] suppressionReason=" + reasonStr + " (" + suppressionReason + ")");
            }

            @Override
            public void onPlayerError(@NonNull PlaybackException error) {
                Log.e(TAG, "[PlaybackError] Fatal error code: " + error.errorCode + ", name: " + error.getErrorCodeName() + ", message: " + error.getMessage(), error);
                boolean isPermanentHttpError = false;
                Throwable cause = error.getCause();
                while (cause != null) {
                    Log.e(TAG, "  -> Caused by: " + cause.getClass().getName() + ": " + cause.getMessage());
                    if (cause instanceof androidx.media3.datasource.HttpDataSource.InvalidResponseCodeException) {
                        androidx.media3.datasource.HttpDataSource.InvalidResponseCodeException respEx =
                            (androidx.media3.datasource.HttpDataSource.InvalidResponseCodeException) cause;
                        Log.e(TAG, "     HTTP Status Code: " + respEx.responseCode);
                        if (respEx.responseCode == 401 || respEx.responseCode == 403 || respEx.responseCode == 404 || respEx.responseCode == 410) {
                            isPermanentHttpError = true;
                            Log.e(TAG, "     Non-recoverable permanent HTTP status: " + respEx.responseCode + ". Auto-recovery will be skipped.");
                        }
                    } else if (cause instanceof androidx.media3.datasource.HttpDataSource.HttpDataSourceException) {
                        androidx.media3.datasource.HttpDataSource.HttpDataSourceException httpEx = (androidx.media3.datasource.HttpDataSource.HttpDataSourceException) cause;
                        String safeUri = "null";
                        if (httpEx.dataSpec != null && httpEx.dataSpec.uri != null) {
                            safeUri = httpEx.dataSpec.uri.toString().replaceAll("token=[^&]+", "token=REDACTED");
                        }
                        Log.e(TAG, "     HttpDataSource type=" + httpEx.type + " uri=" + safeUri
                            + " bytePosition=" + (httpEx.dataSpec != null ? httpEx.dataSpec.position : -1)
                            + " length=" + (httpEx.dataSpec != null ? httpEx.dataSpec.length : -1));
                    }
                    cause = cause.getCause();
                }

                cancelPendingRecovery();

                boolean isNetworkError = !isPermanentHttpError && (
                    error.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED ||
                    error.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT ||
                    error.errorCode == PlaybackException.ERROR_CODE_IO_UNSPECIFIED ||
                    error.errorCode == PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS
                );

                if (isNetworkError && networkRetryCount < MAX_NETWORK_RETRIES) {
                    networkRetryCount++;
                    int targetIndex = player != null ? player.getCurrentMediaItemIndex() : -1;
                    long targetPosition = player != null ? player.getCurrentPosition() : 0;
                    long delayMs = Math.min(1000L * (1 << networkRetryCount), 6000L); // 2s, 4s, 6s exponential backoff
                    Log.w(TAG, "[PlaybackRecovery] Transient network error encountered. Scheduling auto-recovery attempt #"
                        + networkRetryCount + " in " + delayMs + "ms at track index " + targetIndex + " pos " + targetPosition + "ms");
                    pendingRecoveryRunnable = () -> {
                        pendingRecoveryRunnable = null;
                        if (player != null && targetIndex >= 0 && targetIndex < queue.size()) {
                            Log.i(TAG, "[PlaybackRecovery] Executing recovery: seekTo(" + targetIndex + ", " + targetPosition + "ms), prepare(), play()");
                            player.seekTo(targetIndex, targetPosition);
                            player.prepare();
                            player.play();
                        }
                    };
                    mainHandler.postDelayed(pendingRecoveryRunnable, delayMs);
                } else if (listener != null) {
                    listener.onError(error.getMessage());
                }
            }
        });

        // Connect MediaSession directly to ExoPlayer instance
        Intent sessionIntent = new Intent(this, MainActivity.class);
        sessionIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            sessionIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        mediaSession = new MediaSession.Builder(this, player)
            .setSessionActivity(pendingIntent)
            .build();

        // Our plugin binds via LocalBinder, so no MediaController ever connects and
        // onGetSession() is never called. Without addSession(), Media3 never posts the
        // media notification or promotes the service to foreground, and Android kills
        // playback shortly after the app is backgrounded / screen locked.
        addSession(mediaSession);

        Log.i(TAG, "[SonaraAudioService] MediaSession built successfully with token: " + mediaSession.getToken());
    }

    private MediaItem buildMediaItem(TrackItem track) {
        MediaMetadata.Builder metadataBuilder = new MediaMetadata.Builder()
            .setTitle(track.title)
            .setArtist(track.artist)
            .setAlbumTitle(track.album);

        if (track.artworkUrl != null && !track.artworkUrl.isEmpty()) {
            metadataBuilder.setArtworkUri(Uri.parse(track.artworkUrl));
        }

        MediaItem.Builder itemBuilder = new MediaItem.Builder()
            .setMediaId(track.id)
            .setMediaMetadata(metadataBuilder.build());

        if (track.audioUrl != null && !track.audioUrl.isEmpty()) {
            itemBuilder.setUri(Uri.parse(track.audioUrl));
        }

        return itemBuilder.build();
    }

    @Nullable
    @Override
    public MediaSession onGetSession(@NonNull MediaSession.ControllerInfo controllerInfo) {
        try {
            Log.d(TAG, "[onGetSession] Controller connected: " + controllerInfo.getPackageName());
            return mediaSession;
        } catch (Throwable t) {
            Log.e(TAG, "[onGetSession] Error getting session", t);
            return null;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        Log.i(TAG, "[onStartCommand] flags=" + flags + " startId=" + startId + " action=" + (intent != null ? intent.getAction() : "null"));
        return START_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.i(TAG, "[onTaskRemoved] App task removed from recents. player=" + (player != null ? player.isPlaying() : "null"));
        if (player == null || !player.getPlayWhenReady() || player.getPlaybackState() == Player.STATE_ENDED) {
            Log.i(TAG, "[onTaskRemoved] Stopping service since playback is idle/ended");
            stopSelf();
        } else {
            Log.i(TAG, "[onTaskRemoved] Playback is actively running; preserving foreground playback service");
        }
    }

    @OptIn(markerClass = UnstableApi.class)
    @Override
    public void onUpdateNotification(@NonNull MediaSession session, boolean startInForegroundRequired) {
        Log.i(TAG, "[onUpdateNotification] startInForegroundRequired=" + startInForegroundRequired
            + " isPlaying=" + (player != null && player.isPlaying())
            + " playWhenReady=" + (player != null && player.getPlayWhenReady())
            + " playbackState=" + (player != null ? player.getPlaybackState() : -1));
        try {
            super.onUpdateNotification(session, startInForegroundRequired);
            Log.i(TAG, "[onUpdateNotification] Notification updated successfully");
        } catch (Throwable t) {
            Log.e(TAG, "[onUpdateNotification] Failed to update notification", t);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            Log.d(TAG, "[onBind] Action: " + action);
            if ("androidx.media3.session.MediaSessionService".equals(action)) {
                return super.onBind(intent);
            }
        }
        return binder;
    }

    public void setListener(ServiceListener listener) {
        this.listener = listener;
    }

    // Populate native playlist queue into ExoPlayer
    public void setQueue(List<TrackItem> tracks, int startIndex, double startPosition) {
        runOnMain(() -> {
            cancelPendingRecovery();
            networkRetryCount = 0;
            queue.clear();
            queue.addAll(tracks);

            Log.i(TAG, "[setQueue] Setting playlist of " + tracks.size() + " items into single ExoPlayer instance. startIndex=" + startIndex + ", startPos=" + startPosition);

            if (player == null || tracks.isEmpty()) {
                Log.w(TAG, "[setQueue] Player is null or tracks list is empty");
                return;
            }

            List<MediaItem> mediaItems = new ArrayList<>();
            for (int i = 0; i < tracks.size(); i++) {
                TrackItem t = tracks.get(i);
                mediaItems.add(buildMediaItem(t));
                Log.d(TAG, "  [" + i + "] id=\"" + t.id + "\" title=\"" + t.title + "\" artist=\"" + t.artist + "\" uri=" + t.audioUrl + " artUri=" + t.artworkUrl);
            }

            int index = Math.max(0, Math.min(startIndex, mediaItems.size() - 1));
            long positionMs = (long) (Math.max(0, startPosition) * 1000);

            player.setMediaItems(mediaItems, index, positionMs);
            applyRepeatMode();
            applyShuffleMode();
            player.prepare();
            player.play();

            TrackItem current = queue.get(index);
            Log.i(TAG, "[setQueue] Started playback of index " + index + ": \"" + current.title + "\"");
            if (listener != null) {
                listener.onTrackTransition(index, current);
            }

            // Pre-warm DNS cache for all hostnames in the playlist so background sleep does not fail with EAI_NODATA
            new Thread(() -> {
                try {
                    java.util.Set<String> hosts = new java.util.HashSet<>();
                    for (TrackItem t : tracks) {
                        if (t.audioUrl != null && !t.audioUrl.isEmpty()) {
                            try {
                                Uri u = Uri.parse(t.audioUrl);
                                String host = u.getHost();
                                if (host != null && !host.isEmpty()) hosts.add(host);
                            } catch (Throwable ignored) {}
                        }
                    }
                    for (String h : hosts) {
                        try {
                            InetAddress[] addrs = InetAddress.getAllByName(h);
                            Log.i(TAG, "[DNSPrewarm] Pre-warmed " + h + " -> " + java.util.Arrays.toString(addrs));
                        } catch (Throwable t) {
                            Log.w(TAG, "[DNSPrewarm] Unable to pre-warm " + h + ": " + t.getMessage());
                        }
                    }
                } catch (Throwable ignored) {}
            }).start();
        });
    }

    public void playTrackAtIndex(int index, double startPosition) {
        runOnMain(() -> {
            cancelPendingRecovery();
            networkRetryCount = 0;
            if (player == null || index < 0 || index >= queue.size()) {
                Log.w(TAG, "[playTrackAtIndex] Invalid index: " + index + ", queue size: " + queue.size());
                return;
            }
            long positionMs = (long) (Math.max(0, startPosition) * 1000);
            Log.i(TAG, "[playTrackAtIndex] Seeking to index: " + index + " at " + positionMs + "ms: \"" + queue.get(index).title + "\"");
            player.seekTo(index, positionMs);
            player.play();

            TrackItem current = queue.get(index);
            if (listener != null) {
                listener.onTrackTransition(index, current);
            }
        });
    }

    public void next() {
        runOnMain(() -> {
            cancelPendingRecovery();
            networkRetryCount = 0;
            if (player == null) return;
            Log.i(TAG, "[next] hasNextMediaItem=" + player.hasNextMediaItem() + " currentIndex=" + player.getCurrentMediaItemIndex());
            if (player.hasNextMediaItem()) {
                player.seekToNextMediaItem();
                player.play();
            } else if ("all".equals(repeatMode) && !queue.isEmpty()) {
                player.seekTo(0, 0);
                player.play();
            }
        });
    }

    public void previous() {
        runOnMain(() -> {
            cancelPendingRecovery();
            networkRetryCount = 0;
            if (player == null) return;
            Log.i(TAG, "[previous] currentPos=" + player.getCurrentPosition() + " hasPrevious=" + player.hasPreviousMediaItem());
            if (player.getCurrentPosition() > 3000) {
                player.seekTo(0);
                return;
            }
            if (player.hasPreviousMediaItem()) {
                player.seekToPreviousMediaItem();
                player.play();
            } else if ("all".equals(repeatMode) && !queue.isEmpty()) {
                player.seekTo(queue.size() - 1, 0);
                player.play();
            } else {
                player.seekTo(0);
            }
        });
    }

    public void play() {
        runOnMain(() -> {
            if (player != null) {
                Log.i(TAG, "[play] isPlaying=" + player.isPlaying() + " playbackState=" + player.getPlaybackState() + " mediaItemCount=" + player.getMediaItemCount());
                if (player.getMediaItemCount() == 0 && !queue.isEmpty()) {
                    Log.i(TAG, "[play] ExoPlayer was empty, restoring " + queue.size() + " items");
                    setQueue(new ArrayList<>(queue), 0, 0);
                    return;
                }
                if (player.getPlaybackState() == Player.STATE_ENDED) {
                    player.seekTo(0, 0);
                }
                if (player.getPlaybackState() == Player.STATE_IDLE && player.getMediaItemCount() > 0) {
                    player.prepare();
                }
                player.play();
            }
        });
    }

    public boolean getPlayWhenReady() {
        return player != null && player.getPlayWhenReady();
    }

    public void pause() {
        pause("unspecified", "internal");
    }

    public void pause(String reason, String caller) {
        runOnMain(() -> {
            boolean isRecentRecovery = (System.currentTimeMillis() - lastRecoverySuccessTimestamp) < 15000;
            boolean isRecoveryInProgress = pendingRecoveryRunnable != null || isAwaitingNetwork;
            boolean isExplicitUserToggle = "user_toggle".equals(reason) || "user_action".equals(reason);
            if ((isRecentRecovery || isRecoveryInProgress) && !isExplicitUserToggle && player != null && player.isPlaying()) {
                Log.w(TAG, "[pause] REJECTING pause: native is recovering or just recovered (" 
                    + (System.currentTimeMillis() - lastRecoverySuccessTimestamp) 
                    + "ms ago) and is actively playing! reason=" + reason + " caller=" + caller);
                return;
            }

            cancelPendingRecovery();
            if (player != null) {
                Log.i(TAG, "[pause] Pausing ExoPlayer at " + getCurrentPosition() + "s. reason=" + reason + " caller=" + caller
                    + " isPlaying=" + player.isPlaying() + " playWhenReady=" + player.getPlayWhenReady()
                    + " currentIndex=" + player.getCurrentMediaItemIndex());
                player.pause();
            }
        });
    }

    public void togglePlay() {
        runOnMain(() -> {
            if (player != null) {
                if (player.isPlaying()) {
                    pause("user_toggle", "togglePlay");
                } else {
                    play();
                }
            }
        });
    }

    public void seekTo(double seconds) {
        runOnMain(() -> {
            if (player != null) {
                Log.i(TAG, "[seekTo] Seeking to " + seconds + "s");
                player.seekTo((long) (seconds * 1000));
            }
        });
    }

    public void setRepeatMode(String mode) {
        runOnMain(() -> {
            this.repeatMode = mode;
            Log.i(TAG, "[setRepeatMode] " + mode);
            applyRepeatMode();
        });
    }

    private void applyRepeatMode() {
        if (player == null) return;
        if ("one".equals(repeatMode)) {
            player.setRepeatMode(Player.REPEAT_MODE_ONE);
        } else if ("all".equals(repeatMode)) {
            player.setRepeatMode(Player.REPEAT_MODE_ALL);
        } else {
            player.setRepeatMode(Player.REPEAT_MODE_OFF);
        }
    }

    public void setShuffle(boolean shuffle) {
        runOnMain(() -> {
            this.isShuffle = shuffle;
            Log.i(TAG, "[setShuffle] " + shuffle);
            applyShuffleMode();
        });
    }

    private void applyShuffleMode() {
        if (player != null) {
            player.setShuffleModeEnabled(isShuffle);
        }
    }

    public TrackItem getCurrentTrack() {
        int index = getCurrentIndex();
        if (index >= 0 && index < queue.size()) {
            return queue.get(index);
        }
        return null;
    }

    public int getCurrentIndex() {
        return player != null ? player.getCurrentMediaItemIndex() : -1;
    }

    public boolean isPlaying() {
        return player != null && player.isPlaying();
    }

    public double getCurrentPosition() {
        return player != null ? player.getCurrentPosition() / 1000.0 : 0;
    }

    public double getDuration() {
        if (player != null && player.getDuration() > 0) {
            return player.getDuration() / 1000.0;
        }
        TrackItem cur = getCurrentTrack();
        return cur != null ? cur.duration : 0;
    }

    private void startProgressTracking() {
        if (isProgressRunning) return;
        isProgressRunning = true;
        progressHandler.post(progressRunnable);
    }

    private void stopProgressTracking() {
        isProgressRunning = false;
        progressHandler.removeCallbacks(progressRunnable);
    }

    private final Runnable progressRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isProgressRunning || player == null) return;
            if (listener != null) {
                listener.onProgressUpdated(getCurrentPosition(), getDuration());
            }
            progressHandler.postDelayed(this, 500);
        }
    };

    @Override
    public void onDestroy() {
        Log.i(TAG, "[onDestroy] Service being destroyed. isPlaying=" + (player != null && player.isPlaying())
            + " playWhenReady=" + (player != null && player.getPlayWhenReady())
            + "\nCaller trace:\n" + Log.getStackTraceString(new Throwable()));
        cancelPendingRecovery();
        if (networkCallback != null) {
            try {
                ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
                if (cm != null) cm.unregisterNetworkCallback(networkCallback);
            } catch (Throwable ignored) {}
            networkCallback = null;
        }
        if (wifiLock != null && wifiLock.isHeld()) {
            try {
                wifiLock.release();
                Log.i(TAG, "[WifiLock] Released WifiLock");
            } catch (Throwable ignored) {}
            wifiLock = null;
        }
        instance = null;
        stopProgressTracking();
        if (mediaSession != null) {
            Log.i(TAG, "[onDestroy] Releasing MediaSession");
            mediaSession.release();
            mediaSession = null;
        }
        if (player != null) {
            Log.i(TAG, "[onDestroy] Releasing ExoPlayer");
            player.release();
            player = null;
        }
        super.onDestroy();
    }
}
