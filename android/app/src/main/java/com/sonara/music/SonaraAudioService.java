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
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;
import java.util.ArrayList;
import java.util.List;

public class SonaraAudioService extends MediaSessionService {
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

    private final IBinder binder = new LocalBinder();
    private ExoPlayer player;
    private MediaSession mediaSession;
    private final List<TrackItem> queue = new ArrayList<>();
    private String repeatMode = "off"; // "off", "all", "one"
    private boolean isShuffle = false;
    private ServiceListener listener;
    private final Handler progressHandler = new Handler(Looper.getMainLooper());
    private boolean isProgressRunning = false;

    public class LocalBinder extends Binder {
        public SonaraAudioService getService() {
            return SonaraAudioService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
        initExoPlayer();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // App-specific audio channel
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Sonara Music Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background audio playback and lock-screen controls");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(channel);

            // Default Media3 notification channel ID to ensure compatibility
            NotificationChannel defaultChannel = new NotificationChannel(
                DEFAULT_CHANNEL_ID,
                "Sonara Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            defaultChannel.setDescription("Sonara media playback notification");
            defaultChannel.setShowBadge(false);
            defaultChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(defaultChannel);
        }
    }

    @OptIn(markerClass = UnstableApi.class)
    private void initExoPlayer() {
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build();

        player = new ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build();

        player.addListener(new Player.Listener() {
            @Override
            public void onMediaItemTransition(@Nullable MediaItem mediaItem, int reason) {
                int index = player != null ? player.getCurrentMediaItemIndex() : -1;
                TrackItem track = (index >= 0 && index < queue.size()) ? queue.get(index) : null;
                if (listener != null && track != null) {
                    listener.onTrackTransition(index, track);
                }
            }

            @Override
            public void onPlaybackStateChanged(int state) {
                if (state == Player.STATE_ENDED) {
                    if ("all".equals(repeatMode) && !queue.isEmpty() && player != null) {
                        player.seekTo(0, 0);
                        player.play();
                    } else if (listener != null) {
                        listener.onPlaybackStateChanged(false);
                    }
                }
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                if (listener != null) {
                    listener.onPlaybackStateChanged(isPlaying);
                }
                if (isPlaying) {
                    startProgressTracking();
                } else {
                    stopProgressTracking();
                }
            }

            @Override
            public void onPlayerError(@NonNull PlaybackException error) {
                if (listener != null) {
                    listener.onError(error.getMessage());
                }
                if (player != null && player.hasNextMediaItem()) {
                    player.seekToNextMediaItem();
                    player.prepare();
                    player.play();
                }
            }
        });

        // Connect MediaSession directly to ExoPlayer instance
        Intent sessionIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            sessionIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        mediaSession = new MediaSession.Builder(this, player)
            .setSessionActivity(pendingIntent)
            .build();
    }

    private MediaItem buildMediaItem(TrackItem track) {
        MediaMetadata.Builder metadataBuilder = new MediaMetadata.Builder()
            .setTitle(track.title)
            .setArtist(track.artist)
            .setAlbumTitle(track.album);

        if (track.artworkUrl != null && !track.artworkUrl.isEmpty()) {
            metadataBuilder.setArtworkUri(Uri.parse(track.artworkUrl));
        }

        return new MediaItem.Builder()
            .setMediaId(track.id)
            .setUri(track.audioUrl)
            .setMediaMetadata(metadataBuilder.build())
            .build();
    }

    @Nullable
    @Override
    public MediaSession onGetSession(@NonNull MediaSession.ControllerInfo controllerInfo) {
        return mediaSession;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if ("androidx.media3.session.MediaSessionService".equals(action) ||
                "android.media.browse.MediaBrowserService".equals(action)) {
                return super.onBind(intent);
            }
        }
        return binder;
    }

    public void setListener(ServiceListener listener) {
        this.listener = listener;
    }

    // Populate native playlist queue into ExoPlayer
    public synchronized void setQueue(List<TrackItem> tracks, int startIndex, double startPosition) {
        queue.clear();
        queue.addAll(tracks);

        if (player == null || tracks.isEmpty()) return;

        List<MediaItem> mediaItems = new ArrayList<>();
        for (TrackItem t : tracks) {
            mediaItems.add(buildMediaItem(t));
        }

        int index = Math.max(0, Math.min(startIndex, mediaItems.size() - 1));
        long positionMs = (long) (Math.max(0, startPosition) * 1000);

        player.setMediaItems(mediaItems, index, positionMs);
        applyRepeatMode();
        applyShuffleMode();
        player.prepare();
        player.play();

        TrackItem current = queue.get(index);
        if (listener != null) {
            listener.onTrackTransition(index, current);
        }
    }

    public synchronized void playTrackAtIndex(int index, double startPosition) {
        if (player == null || index < 0 || index >= queue.size()) return;
        long positionMs = (long) (Math.max(0, startPosition) * 1000);
        player.seekTo(index, positionMs);
        player.play();

        TrackItem current = queue.get(index);
        if (listener != null) {
            listener.onTrackTransition(index, current);
        }
    }

    public synchronized void next() {
        if (player == null) return;
        if (player.hasNextMediaItem()) {
            player.seekToNextMediaItem();
            player.play();
        } else if ("all".equals(repeatMode) && !queue.isEmpty()) {
            player.seekTo(0, 0);
            player.play();
        }
    }

    public synchronized void previous() {
        if (player == null) return;
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
    }

    public void play() {
        if (player != null) {
            if (player.getPlaybackState() == Player.STATE_ENDED) {
                player.seekTo(0, 0);
            }
            player.play();
        }
    }

    public void pause() {
        if (player != null) {
            player.pause();
        }
    }

    public void togglePlay() {
        if (player != null) {
            if (player.isPlaying()) {
                player.pause();
            } else {
                play();
            }
        }
    }

    public void seekTo(double seconds) {
        if (player != null) {
            player.seekTo((long) (seconds * 1000));
        }
    }

    public void setRepeatMode(String mode) {
        this.repeatMode = mode;
        applyRepeatMode();
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
        this.isShuffle = shuffle;
        applyShuffleMode();
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
        stopProgressTracking();
        if (mediaSession != null) {
            mediaSession.release();
            mediaSession = null;
        }
        if (player != null) {
            player.release();
            player = null;
        }
        super.onDestroy();
    }
}
