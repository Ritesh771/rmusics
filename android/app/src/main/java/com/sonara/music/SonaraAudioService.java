package com.sonara.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
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
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.session.DefaultMediaNotificationProvider;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;
import java.util.ArrayList;
import java.util.List;

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
                .setConnectTimeoutMs(20000)
                .setReadTimeoutMs(20000)
                .setAllowCrossProtocolRedirects(true);

        androidx.media3.datasource.DefaultDataSource.Factory dataSourceFactory =
            new androidx.media3.datasource.DefaultDataSource.Factory(this, httpDataSourceFactory);

        androidx.media3.exoplayer.source.DefaultMediaSourceFactory mediaSourceFactory =
            new androidx.media3.exoplayer.source.DefaultMediaSourceFactory(dataSourceFactory);

        player = new ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
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
            public void onPlaybackStateChanged(int state) {
                String stateStr = (state == Player.STATE_IDLE) ? "STATE_IDLE" :
                                  (state == Player.STATE_BUFFERING) ? "STATE_BUFFERING" :
                                  (state == Player.STATE_READY) ? "STATE_READY" : "STATE_ENDED";
                Log.i(TAG, "[PlaybackState] " + stateStr + " (pos: " + getCurrentPosition() + "s, dur: " + getDuration() + "s, isPlaying: "
                    + (player != null && player.isPlaying()) + ", playWhenReady: " + (player != null && player.getPlayWhenReady())
                    + ", suppression: " + (player != null ? player.getPlaybackSuppressionReason() : -1) + ")");
                switch (state) {
                    case Player.STATE_IDLE:
                        break;
                    case Player.STATE_BUFFERING:
                        break;
                    case Player.STATE_READY:
                        if (player != null && player.getPlayWhenReady()) {
                            startProgressTracking();
                        }
                        break;
                    case Player.STATE_ENDED:
                        Log.i(TAG, "[PlaybackState] Track natural end reached. currentIndex: " + getCurrentIndex() + ", repeatMode: " + repeatMode);
                        if ("all".equals(repeatMode) && !queue.isEmpty() && player != null) {
                            Log.i(TAG, "[PlaybackState] Repeating all: seeking to track 0");
                            player.seekTo(0, 0);
                            player.prepare();
                            player.play();
                        } else if (listener != null) {
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
                Log.e(TAG, "[PlaybackError] Error code: " + error.errorCode + ", name: " + error.getErrorCodeName() + ", message: " + error.getMessage(), error);
                if (listener != null) {
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
        });
    }

    public void playTrackAtIndex(int index, double startPosition) {
        runOnMain(() -> {
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

    public void pause() {
        runOnMain(() -> {
            if (player != null) {
                Log.i(TAG, "[pause] Pausing ExoPlayer at " + getCurrentPosition() + "s");
                player.pause();
            }
        });
    }

    public void togglePlay() {
        runOnMain(() -> {
            if (player != null) {
                if (player.isPlaying()) {
                    pause();
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
