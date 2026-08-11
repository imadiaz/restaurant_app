import React, { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';

export interface DropLocation {
  droppableId: string;
  index: number;
}

export interface DropResult {
  source: DropLocation;
  destination: DropLocation | null;
  draggableId: string;
  type: string;
}

interface DragState {
  source: DropLocation;
  destination: DropLocation;
  draggableId: string;
  type: string;
}

interface DragContextValue {
  start: (state: DragState) => void;
  updateDestination: (destination: DropLocation, type: string) => void;
  finish: (droppableId: string, type: string, disabled: boolean) => void;
  cancel: () => void;
  moveByKeyboard: (source: DropLocation, draggableId: string, type: string, offset: number) => void;
}

const DragContext = createContext<DragContextValue | null>(null);
const DroppableContext = createContext({ droppableId: '', type: 'DEFAULT', disabled: false });

export const DragDropContext = ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (result: DropResult) => void }) => {
  const dragState = useRef<DragState | null>(null);
  const start = useCallback((state: DragState) => { dragState.current = state; }, []);
  const updateDestination = useCallback((destination: DropLocation, type: string) => {
    if (dragState.current?.type === type) dragState.current = { ...dragState.current, destination };
  }, []);
  const cancel = useCallback(() => { dragState.current = null; }, []);
  const finish = useCallback((droppableId: string, type: string, disabled: boolean) => {
    const state = dragState.current;
    if (!state || disabled || state.type !== type || state.destination.droppableId !== droppableId) return;
    onDragEnd({ source: state.source, destination: state.destination, draggableId: state.draggableId, type: state.type });
    dragState.current = null;
  }, [onDragEnd]);
  const moveByKeyboard = useCallback((source: DropLocation, draggableId: string, type: string, offset: number) => {
    const destination = { ...source, index: Math.max(0, source.index + offset) };
    if (destination.index !== source.index) onDragEnd({ source, destination, draggableId, type });
  }, [onDragEnd]);
  const value = useMemo(() => ({ start, updateDestination, finish, cancel, moveByKeyboard }), [start, updateDestination, finish, cancel, moveByKeyboard]);
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

interface DroppableProvided {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: React.HTMLAttributes<HTMLElement>;
  placeholder: null;
}

export const Droppable = ({
  children,
  droppableId,
  type = 'DEFAULT',
  isDropDisabled = false,
}: {
  children: (provided: DroppableProvided) => ReactNode;
  droppableId: string;
  type?: string;
  isDropDisabled?: boolean;
}) => {
  const context = useContext(DragContext);
  const droppableProps: React.HTMLAttributes<HTMLElement> = {
    onDragOver: (event) => {
      if (!isDropDisabled) event.preventDefault();
    },
    onDrop: (event) => {
      event.preventDefault();
      event.stopPropagation();
      context?.finish(droppableId, type, isDropDisabled);
    },
  };

  return (
    <DroppableContext.Provider value={{ droppableId, type, disabled: isDropDisabled }}>
      {children({ innerRef: () => undefined, droppableProps, placeholder: null })}
    </DroppableContext.Provider>
  );
};

interface DraggableProvided {
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: React.HTMLAttributes<HTMLElement>;
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
}

export const Draggable = ({
  children,
  draggableId,
  index,
  isDragDisabled = false,
}: {
  children: (provided: DraggableProvided) => ReactNode;
  draggableId: string;
  index: number;
  isDragDisabled?: boolean;
}) => {
  const context = useContext(DragContext);
  const droppable = useContext(DroppableContext);
  const disabled = isDragDisabled || droppable.disabled;
  const draggableProps: React.HTMLAttributes<HTMLElement> = {
    draggable: !disabled,
    onDragStart: (event) => {
      if (!context || disabled) return;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggableId);
      context.start({
        source: { droppableId: droppable.droppableId, index },
        destination: { droppableId: droppable.droppableId, index },
        draggableId,
        type: droppable.type,
      });
    },
    onDragEnter: () => {
      context?.updateDestination({ droppableId: droppable.droppableId, index }, droppable.type);
    },
    onDragEnd: () => {
      context?.cancel();
    },
  };

  return children({
    innerRef: () => undefined,
    draggableProps,
    dragHandleProps: {
      'aria-label': 'Drag to reorder; use arrow keys for keyboard ordering',
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      draggable: !disabled,
      onDragStart: draggableProps.onDragStart,
      onKeyDown: (event) => {
        if (disabled || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
        event.preventDefault();
        context?.moveByKeyboard(
          { droppableId: droppable.droppableId, index },
          draggableId,
          droppable.type,
          event.key === 'ArrowUp' ? -1 : 1,
        );
      },
    },
  });
};
