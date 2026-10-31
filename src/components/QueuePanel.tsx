import { usePlayer } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { X, GripVertical, Trash2, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanSongTitle } from "@/lib/song-utils";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function QueuePanel() {
  const {
    queuePanelOpen, closeQueuePanel, queue, currentIndex,
    removeFromQueue, reorderQueue,
  } = usePlayer();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (!queuePanelOpen) return null;

  const current = queue[currentIndex];
  const upNext = queue.slice(currentIndex + 1);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = Number(active.id);
    const to = Number(over.id);
    reorderQueue(from, to);
  };

  return (
    <div
      className="fixed z-[90] bg-card/95 text-card-foreground backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col
                 inset-x-2 bottom-36 top-20 rounded-xl animate-in slide-in-from-bottom-4 fade-in duration-200
                 md:inset-auto md:right-3 md:bottom-24 md:top-20 md:w-96 md:slide-in-from-right-4"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 shrink-0">
        <div>
          <h2 className="font-extrabold text-lg text-foreground tracking-tight">Queue</h2>
          <p className="text-[11px] text-muted-foreground font-medium">{queue.length} track{queue.length === 1 ? "" : "s"}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full" onClick={closeQueuePanel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {current && (
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold mb-2 px-1">Now playing</div>
            <Row song={current} highlight onJump={() => {}} />
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-2 px-1">Next up</div>
          {upNext.length === 0 ? (
            <div className="text-sm text-muted-foreground px-1">Queue is empty</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={upNext.map((_, i) => String(currentIndex + 1 + i))}
                strategy={verticalListSortingStrategy}
              >
                {upNext.map((s, i) => {
                  const absIdx = currentIndex + 1 + i;
                  return (
                    <SortableRow
                      key={s.id + absIdx}
                      id={String(absIdx)}
                      song={s}
                      onJump={() => usePlayer.setState({ currentIndex: absIdx, isPlaying: true, progress: 0, duration: s.duration ?? 0 })}
                      onRemove={() => removeFromQueue(absIdx)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ song, highlight, onJump }: { song: any; highlight?: boolean; onJump: () => void }) {
  return (
    <button
      onClick={onJump}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-accent/70 transition-all border border-transparent",
        highlight && "bg-primary/10 border-primary/25 shadow-xs"
      )}
    >
      <div className="h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-border/50">
        {song.thumbnail_url ? <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <Music className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-semibold truncate text-foreground", highlight && "text-primary font-bold")}>{cleanSongTitle(song.title)}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</div>
      </div>
    </button>
  );
}

function SortableRow({
  id, song, onJump, onRemove,
}: { id: string; song: any; onJump: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group">
      <button
        {...attributes} {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <Row song={song} onJump={onJump} />
      </div>
      <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}