package com.sonara.music;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.activity.result.ActivityResultLauncher;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "SonaraNativeAudio")
public class SonaraNativeAudioPlugin extends Plugin {
    private static final String TAG = "SonaraPlugin";
    private SonaraAudioService audioService;
    private boolean isBound = false;
    private final List<Runnable> pendingOperations = new ArrayList<>();
    private final android.os.Handler mainHandler = new android.os.Handler(android.os.Looper.getMainLooper());

    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            mainHandler.post(() -> {
                if (binder instanceof SonaraAudioService.LocalBinder) {
                    SonaraAudioService.LocalBinder localBinder = (SonaraAudioService.LocalBinder) binder;
                    audioService = localBinder.getService();
                } else if (SonaraAudioService.getInstance() != null) {
                    audioService = SonaraAudioService.getInstance();
                }
                if (audioService != null) {
                    isBound = true;
                    setupServiceListener();

                    List<Runnable> ops;
                    synchronized (pendingOperations) {
                        ops = new ArrayList<>(pendingOperations);
                        pendingOperations.clear();
                    }
                    for (Runnable op : ops) {
                        try {
                            op.run();
                        } catch (Exception e) {
                            Log.e(TAG, "Error running pending op", e);
                        }
                    }
                }
            });
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mainHandler.post(() -> {
                audioService = null;
                isBound = false;
            });
        }
    };

    @Override
    public void load() {
        super.load();
        // Lazy binding on first user playback request to guarantee zero startup overhead and no launch crashes
    }

    private void bindAudioService() {
        Context context = getContext();
        if (context == null) return;
        try {
            Intent intent = new Intent(context, SonaraAudioService.class);
            context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
        } catch (Exception e) {
            Log.e(TAG, "Error binding audio service", e);
        }
    }

    private void setupServiceListener() {
        if (audioService == null) return;
        audioService.setListener(new SonaraAudioService.ServiceListener() {
            @Override
            public void onTrackTransition(int index, SonaraAudioService.TrackItem track) {
                try {
                    JSObject ret = new JSObject();
                    ret.put("index", index);
                    if (track != null) {
                        JSObject s = new JSObject();
                        s.put("id", track.id);
                        s.put("title", track.title);
                        s.put("artist", track.artist);
                        s.put("album", track.album);
                        s.put("audio_url", track.audioUrl);
                        s.put("thumbnail_url", track.artworkUrl);
                        s.put("duration", track.duration);
                        ret.put("song", s);
                    }
                    notifyListeners("trackTransition", ret);
                } catch (Throwable t) {
                    Log.e(TAG, "Error in onTrackTransition listener", t);
                }
            }

            @Override
            public void onPlaybackStateChanged(boolean isPlaying) {
                try {
                    JSObject ret = new JSObject();
                    ret.put("isPlaying", isPlaying);
                    notifyListeners("playbackState", ret);
                } catch (Throwable t) {
                    Log.e(TAG, "Error in onPlaybackStateChanged listener", t);
                }
            }

            @Override
            public void onProgressUpdated(double position, double duration) {
                try {
                    JSObject ret = new JSObject();
                    ret.put("position", position);
                    ret.put("duration", duration);
                    notifyListeners("progress", ret);
                } catch (Throwable t) {
                    Log.e(TAG, "Error in onProgressUpdated listener", t);
                }
            }

            @Override
            public void onError(String message) {
                try {
                    JSObject ret = new JSObject();
                    ret.put("message", message);
                    notifyListeners("error", ret);
                } catch (Throwable t) {
                    Log.e(TAG, "Error in onError listener", t);
                }
            }
        });
    }

    private void runWithService(Runnable op) {
        mainHandler.post(() -> {
            try {
                if (audioService == null) {
                    audioService = SonaraAudioService.getInstance();
                }
                if (audioService != null) {
                    setupServiceListener();
                    op.run();
                } else {
                    synchronized (pendingOperations) {
                        pendingOperations.add(op);
                    }
                    bindAudioService();
                }
            } catch (Throwable t) {
                Log.e(TAG, "Error running op with audio service", t);
            }
        });
    }

    @PluginMethod
    public void setQueue(PluginCall call) {
        JSArray tracksArray = call.getArray("tracks");
        int startIndex = call.getInt("startIndex", 0);
        double startPosition = call.getDouble("startPosition", 0.0);

        if (tracksArray == null) {
            call.reject("Must provide tracks array");
            return;
        }

        List<SonaraAudioService.TrackItem> list = new ArrayList<>();
        try {
            for (int i = 0; i < tracksArray.length(); i++) {
                JSONObject obj = tracksArray.getJSONObject(i);
                list.add(new SonaraAudioService.TrackItem(
                    obj.optString("id", ""),
                    obj.optString("title", "Unknown"),
                    obj.optString("artist", "Unknown"),
                    obj.optString("album", ""),
                    obj.optString("audio_url", ""),
                    obj.optString("thumbnail_url", ""),
                    obj.optDouble("duration", 0.0)
                ));
            }
        } catch (Exception e) {
            call.reject("Error parsing tracks: " + e.getMessage());
            return;
        }

        runWithService(() -> {
            Log.i(TAG, "[setQueue] Received " + list.size() + " tracks from JS bridge");
            audioService.setQueue(list, startIndex, startPosition);
            call.resolve();
        });
    }

    @PluginMethod
    public void playSong(PluginCall call) {
        JSObject songObj = call.getObject("song");
        double startTime = call.getDouble("startTime", 0.0);
        if (songObj == null) {
            call.reject("Must provide song");
            return;
        }

        SonaraAudioService.TrackItem track = new SonaraAudioService.TrackItem(
            songObj.optString("id", ""),
            songObj.optString("title", "Unknown"),
            songObj.optString("artist", "Unknown"),
            songObj.optString("album", ""),
            songObj.optString("audio_url", ""),
            songObj.optString("thumbnail_url", ""),
            songObj.optDouble("duration", 0.0)
        );

        List<SonaraAudioService.TrackItem> singleList = new ArrayList<>();
        singleList.add(track);

        runWithService(() -> {
            audioService.setQueue(singleList, 0, startTime);
            call.resolve();
        });
    }

    @PluginMethod
    public void togglePlay(PluginCall call) {
        runWithService(() -> {
            audioService.togglePlay();
            call.resolve();
        });
    }

    @PluginMethod
    public void pause(PluginCall call) {
        runWithService(() -> {
            audioService.pause();
            call.resolve();
        });
    }

    @PluginMethod
    public void resume(PluginCall call) {
        runWithService(() -> {
            audioService.play();
            call.resolve();
        });
    }

    @PluginMethod
    public void next(PluginCall call) {
        runWithService(() -> {
            audioService.next();
            call.resolve();
        });
    }

    @PluginMethod
    public void prev(PluginCall call) {
        runWithService(() -> {
            audioService.previous();
            call.resolve();
        });
    }

    @PluginMethod
    public void seek(PluginCall call) {
        double time = call.getDouble("time", 0.0);
        runWithService(() -> {
            audioService.seekTo(time);
            call.resolve();
        });
    }

    @PluginMethod
    public void setRepeat(PluginCall call) {
        String repeat = call.getString("repeat", "off");
        runWithService(() -> {
            audioService.setRepeatMode(repeat);
            call.resolve();
        });
    }

    @PluginMethod
    public void setShuffle(PluginCall call) {
        boolean shuffle = call.getBoolean("shuffle", false);
        runWithService(() -> {
            audioService.setShuffle(shuffle);
            call.resolve();
        });
    }

    @PluginMethod
    public void getState(PluginCall call) {
        runWithService(() -> {
            JSObject ret = new JSObject();
            ret.put("isPlaying", audioService.isPlaying());
            ret.put("position", audioService.getCurrentPosition());
            ret.put("duration", audioService.getDuration());
            ret.put("currentIndex", audioService.getCurrentIndex());
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }

    @Override
    protected void handleOnDestroy() {
        if (isBound) {
            try {
                getContext().unbindService(serviceConnection);
            } catch (Exception ignored) {}
            isBound = false;
        }
        super.handleOnDestroy();
    }
}
