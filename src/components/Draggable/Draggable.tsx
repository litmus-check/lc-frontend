'use client';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

function Draggable({keyOrder, setKeyOrder}: any) {
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={keyOrder}
        strategy={verticalListSortingStrategy}
      >
        {keyOrder?.map((keyName: string )=> <SortableItem key={keyName} keyName={keyName} />)}
      </SortableContext>
    </DndContext>
  );
  
  function handleDragEnd(event: any) {
    const {active, over} = event;
    
    if (active.id!== over.id) {
      setKeyOrder((items: any) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}

export default Draggable;