
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ObjectType, LevelObject } from '../types';
import { GRID_SIZE, CANVAS_HEIGHT, OBJECT_CONFIG } from '../constants';
import { Move, RotateCw } from 'lucide-react';
import { translations } from '../App';

interface EditorProps {
  objects: LevelObject[];
  selectedIds: string[];
  onAddObject: (obj: LevelObject) => void;
  onRemoveObject: (id: string) => void;
  onUpdateObject: (obj: LevelObject) => void;
  onMoveObjects: (ids: string[], deltaX: number, deltaY: number) => void;
  onSetSelectedIds: (ids: string[]) => void;
  selectedTool: ObjectType | 'ERASER' | 'ROTATE' | 'SELECT' | 'MOVE';
  zoom: number;
  lang: 'es' | 'en' | 'pt' | 'fr';
  syncLineX?: number | null;
}

export const Editor: React.FC<EditorProps> = ({ 
  objects, 
  selectedIds,
  onAddObject, 
  onRemoveObject, 
  onUpdateObject, 
  onMoveObjects,
  onSetSelectedIds,
  selectedTool, 
  zoom,
  lang,
  syncLineX
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number, y: number, screenX: number, screenY: number } | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const t = translations[lang];
  const moveSession = useRef<{ lastX: number, lastY: number } | null>(null);

  // Auto-scroll when syncLineX updates
  useEffect(() => {
    if (syncLineX !== null && containerRef.current) {
      const linePosPixels = syncLineX * zoom;
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      
      // Target scroll to keep playhead at 30% of the screen from the left
      const targetScroll = linePosPixels - (containerWidth * 0.3);
      
      // We only want to auto-scroll if it's playing music
      container.scrollLeft = targetScroll;
    }
  }, [syncLineX, zoom]);

  const getGridCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollX = containerRef.current.scrollLeft;
    const scrollY = containerRef.current.scrollTop;
    const x = Math.floor((clientX - rect.left + scrollX) / (GRID_SIZE * zoom));
    const y = 11 - Math.floor((clientY - rect.top + scrollY) / (GRID_SIZE * zoom));
    if (y >= 0 && y < 12 && x >= 0) return { x, y };
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getGridCoords(e.clientX, e.clientY);
    setHoverPos(pos);

    if (dragStart) {
      if (!isDragging) {
        const dx = Math.abs(e.clientX - dragStart.screenX);
        const dy = Math.abs(e.clientY - dragStart.screenY);
        if (dx > 4 || dy > 4) setIsDragging(true);
      }

      if (isDragging) {
        if ((selectedTool as string) === 'SELECT') {
          if (pos) {
            setMarqueeBox({
              x1: Math.min(dragStart.x, pos.x),
              y1: Math.min(dragStart.y, pos.y),
              x2: Math.max(dragStart.x, pos.x),
              y2: Math.max(dragStart.y, pos.y),
            });
          }
        } else if ((selectedTool as string) === 'MOVE' && pos && moveSession.current) {
          const deltaX = pos.x - moveSession.current.lastX;
          const deltaY = pos.y - moveSession.current.lastY;
          if (deltaX !== 0 || deltaY !== 0) {
            onMoveObjects(selectedIds, deltaX, deltaY);
            moveSession.current = { lastX: pos.x, lastY: pos.y };
          }
        } else if (typeof selectedTool === 'string' && !['ERASER', 'ROTATE', 'SELECT', 'MOVE'].includes(selectedTool as string)) {
          if (pos) {
            const existing = objects.find(obj => obj.x === pos.x && obj.y === pos.y);
            if (!existing) {
              onAddObject({
                id: Math.random().toString(36).substr(2, 9),
                type: selectedTool as ObjectType,
                x: pos.x,
                y: pos.y,
                rotation: 0
              });
            }
          }
        } else if (selectedTool === 'ERASER' || e.buttons === 2) {
          if (pos) {
            const existing = objects.find(obj => obj.x === pos.x && obj.y === pos.y);
            if (existing) onRemoveObject(existing.id);
          }
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getGridCoords(e.clientX, e.clientY);
    if (!pos) return;

    setDragStart({ ...pos, screenX: e.clientX, screenY: e.clientY });
    const existing = objects.find(obj => obj.x === pos.x && obj.y === pos.y);
    const tool = selectedTool as string;

    if (e.button === 2) {
      if (existing) onRemoveObject(existing.id);
      return;
    }

    if (tool === 'MOVE') {
      if (existing) {
        if (!selectedIds.includes(existing.id)) {
          onSetSelectedIds([...selectedIds, existing.id]);
        }
        moveSession.current = { lastX: pos.x, lastY: pos.y };
      } else if (selectedIds.length > 0) {
        const pivotObj = objects.find(o => o.id === selectedIds[0]);
        if (pivotObj) {
          const deltaX = pos.x - pivotObj.x;
          const deltaY = pos.y - pivotObj.y;
          onMoveObjects(selectedIds, deltaX, deltaY);
        }
      }
    } else if (tool === 'ROTATE') {
      if (existing) {
        onUpdateObject({
          ...existing,
          rotation: ((existing.rotation || 0) + 90) % 360
        });
      }
    } else if (tool === 'ERASER') {
      if (existing) onRemoveObject(existing.id);
    } else if (typeof selectedTool === 'string' && !['SELECT'].includes(tool)) {
      if (existing) onRemoveObject(existing.id);
      onAddObject({
        id: Math.random().toString(36).substr(2, 9),
        type: selectedTool as ObjectType,
        x: pos.x,
        y: pos.y,
        rotation: 0
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const tool = selectedTool as string;
    if (tool === 'SELECT') {
      if (isDragging && marqueeBox) {
        const selectedInBox = objects.filter(obj => 
          obj.x >= marqueeBox.x1 && obj.x <= marqueeBox.x2 &&
          obj.y >= marqueeBox.y1 && obj.y <= marqueeBox.y2
        ).map(o => o.id);
        if (e.shiftKey) {
          onSetSelectedIds(Array.from(new Set([...selectedIds, ...selectedInBox])));
        } else {
          onSetSelectedIds(selectedInBox);
        }
      } else if (!isDragging) {
        const pos = getGridCoords(e.clientX, e.clientY);
        if (pos) {
          const existing = objects.find(obj => obj.x === pos.x && obj.y === pos.y);
          if (existing) {
            if (selectedIds.includes(existing.id)) {
              onSetSelectedIds(selectedIds.filter(id => id !== existing.id));
            } else {
              onSetSelectedIds([...selectedIds, existing.id]);
            }
          } else if (!e.shiftKey) {
            onSetSelectedIds([]);
          }
        }
      }
    }
    setDragStart(null);
    setMarqueeBox(null);
    setIsDragging(false);
    moveSession.current = null;
  };

  const gridStyle = {
    width: `${20000 * zoom}px`,
    height: `${CANVAS_HEIGHT * zoom}px`,
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
    position: 'relative' as const
  };

  return (
    <div 
      className="flex-1 overflow-auto bg-[#0a0f1d] relative cursor-crosshair select-none scroll-smooth"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => { setHoverPos(null); handleMouseUp(e); }}
      onContextMenu={(e) => e.preventDefault()}
      ref={containerRef}
    >
      <div style={gridStyle}>
        {/* Playhead Sync Line */}
        {syncLineX !== null && (
          <div 
            style={{
              position: 'absolute',
              left: syncLineX * zoom,
              top: 0,
              width: '2px',
              height: 12 * GRID_SIZE * zoom,
              zIndex: 5,
              pointerEvents: 'none'
            }}
            className="bg-cyan-400 shadow-[0_0_20px_#22d3ee] transition-all duration-75"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-[2px] animate-pulse" />
          </div>
        )}

        {objects.map((obj) => {
          const isSelected = selectedIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left: obj.x * GRID_SIZE * zoom,
                top: (11 - obj.y) * GRID_SIZE * zoom,
                width: GRID_SIZE * zoom,
                height: GRID_SIZE * zoom,
                zIndex: isSelected ? 15 : 10,
                transform: `rotate(${obj.rotation || 0}deg)`,
                transition: (isDragging && (selectedTool as string) === 'MOVE') ? 'none' : 'transform 0.1s ease-out'
              }}
              className={`pointer-events-none ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 rounded-sm' : ''}`}
            >
              <div className="w-full h-full">
                {OBJECT_CONFIG[obj.type].icon}
              </div>
            </div>
          );
        })}

        {marqueeBox && (
          <div
            style={{
              position: 'absolute',
              left: marqueeBox.x1 * GRID_SIZE * zoom,
              top: (11 - marqueeBox.y2) * GRID_SIZE * zoom,
              width: (marqueeBox.x2 - marqueeBox.x1 + 1) * GRID_SIZE * zoom,
              height: (marqueeBox.y2 - marqueeBox.y1 + 1) * GRID_SIZE * zoom,
              zIndex: 30,
              pointerEvents: 'none'
            }}
            className="border-2 border-dashed border-indigo-400 bg-indigo-500/20"
          />
        )}

        {hoverPos && !isDragging && (
          <div
            style={{
              position: 'absolute',
              left: hoverPos.x * GRID_SIZE * zoom,
              top: (11 - hoverPos.y) * GRID_SIZE * zoom,
              width: GRID_SIZE * zoom,
              height: GRID_SIZE * zoom,
              zIndex: 20
            }}
            className="border-2 border-white/20 pointer-events-none flex items-center justify-center opacity-40"
          >
            {!['ERASER', 'ROTATE', 'SELECT', 'MOVE'].includes(selectedTool as string) && OBJECT_CONFIG[selectedTool as ObjectType].icon}
            {selectedTool === 'ERASER' && <span className="text-white text-[10px] font-black">X</span>}
          </div>
        )}
      </div>
    </div>
  );
};
