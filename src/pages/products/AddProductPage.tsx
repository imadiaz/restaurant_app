import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  CheckSquare, 
  CircleDot,
  Image as ImageIcon
} from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import AnatomyTextArea from '../../components/anatomy/AnatomyTextArea';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import PageHeader from '../../components/common/PageHeader';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';


// --- TYPES ---
interface ModifierOption {
  id: string;
  name: string;
  price: string;
}

interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

const AddProductPage: React.FC = () => {

  // --- FORM STATE ---
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // 1. Dropped outside the list? Do nothing.
    if (!destination) return;

    // 2. Reordering GROUPS (Moving a whole card up/down)
    if (type === 'GROUP') {
      const newGroups = Array.from(modifierGroups);
      const [movedGroup] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, movedGroup);
      setModifierGroups(newGroups);
      return;
    }

    // 3. Reordering OPTIONS (Moving an item inside a group)
    if (type === 'OPTION') {
      // Find the group we are dragging FROM and TO
      const sourceGroupIndex = modifierGroups.findIndex(g => g.id === source.droppableId);
      const destGroupIndex = modifierGroups.findIndex(g => g.id === destination.droppableId);

      if (sourceGroupIndex === -1 || destGroupIndex === -1) return;

      const newGroups = [...modifierGroups];
      const sourceGroup = newGroups[sourceGroupIndex];
      const destGroup = newGroups[destGroupIndex];

      // Remove from old index
      const [movedOption] = sourceGroup.options.splice(source.index, 1);
      
      // Add to new index (potentially in a different group!)
      destGroup.options.splice(destination.index, 0, movedOption);

      setModifierGroups(newGroups);
    }
  };

  // --- MODIFIER LOGIC (Add/Remove/Update) ---
  const addModifierGroup = () => {
    const newGroup: ModifierGroup = {
      id: `group-${Date.now()}`, // Ensure string ID
      name: '',
      required: false,
      multiSelect: false,
      options: [{ id: `opt-${Date.now()}`, name: '', price: '' }]
    };
    setModifierGroups([...modifierGroups, newGroup]);
  };

  const removeModifierGroup = (groupId: string) => {
    setModifierGroups(modifierGroups.filter(g => g.id !== groupId));
  };

  const updateGroupField = (groupId: string, field: keyof ModifierGroup, value: any) => {
    setModifierGroups(modifierGroups.map(g => 
      g.id === groupId ? { ...g, [field]: value } : g
    ));
  };

  const addOption = (groupId: string) => {
    setModifierGroups(modifierGroups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        options: [...g.options, { id: `opt-${Date.now()}`, name: '', price: '' }]
      };
    }));
  };

  const removeOption = (groupId: string, optionId: string) => {
    setModifierGroups(modifierGroups.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, options: g.options.filter(o => o.id !== optionId) };
    }));
  };

  const updateOption = (groupId: string, optionId: string, field: keyof ModifierOption, value: any) => {
    setModifierGroups(modifierGroups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        options: g.options.map(o => o.id === optionId ? { ...o, [field]: value } : o)
      };
    }));
  };

  const handleSave = () => {
    console.log({ productName, description, basePrice, category, modifierGroups });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <PageHeader 
     title={"Add New Dish"} 
     subtitle={"Create a new item for your menu"} 
     actions={
        <div className='flex'>
            <AnatomyButton onClick={handleSave}>Save Product</AnatomyButton>
        </div>
     } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: BASIC INFO --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Details Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <AnatomyText.H3>Basic Information</AnatomyText.H3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <AnatomyTextField 
                  label="Dish Name"
                  placeholder="e.g. Truffle Mushroom Burger"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <AnatomyTextArea 
                  label="Description"
                  placeholder="Describe ingredients and taste..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <AnatomySelect 
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Salads">Salads</option>
                  <option value="Drinks">Drinks</option>
                </AnatomySelect>
              </div>

              <div>
                <AnatomyTextField 
                  label="Base Price ($)"
                  type="number"
                  placeholder="0.00"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. Modifiers Section (DRAG AND DROP CONTEXT) */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <AnatomyText.H3>Customization & Add-ons</AnatomyText.H3>
                <button 
                  onClick={addModifierGroup}
                  className="text-primary text-sm font-bold flex items-center hover:underline"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Group
                </button>
              </div>

              {/* DROPPABLE AREA FOR GROUPS */}
              <Droppable droppableId="groups-list" type="GROUP">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-4" // Add spacing between draggable groups
                  >
                    {modifierGroups.length === 0 ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center">
                        <AnatomyText.Body className="text-gray-400">No modifiers added yet.</AnatomyText.Body>
                        <AnatomyText.Small className="text-gray-400 mt-1">Add groups like "Choice of Size" or "Extra Toppings"</AnatomyText.Small>
                      </div>
                    ) : (
                      modifierGroups.map((group, index) => (
                        <Draggable key={group.id} draggableId={group.id} index={index}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group-card"
                            >
                              
                              {/* Remove Group Button */}
                              <button 
                                onClick={() => removeModifierGroup(group.id)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>

                              {/* Drag Handle for Group */}
                              <div 
                                {...provided.dragHandleProps} 
                                className="absolute top-6 left-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Group Header */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pl-6 pr-8">
                                <div>
                                  <AnatomyTextField 
                                    label="Group Name"
                                    placeholder="e.g. Select Size"
                                    value={group.name}
                                    onChange={(e) => updateGroupField(group.id, 'name', e.target.value)}
                                  />
                                </div>
                                
                                <div className="flex items-end gap-6 pb-3">
                                  {/* Required Checkbox */}
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={group.required}
                                      onChange={(e) => updateGroupField(group.id, 'required', e.target.checked)}
                                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <AnatomyText.Label className="mb-0 cursor-pointer">Required?</AnatomyText.Label>
                                  </label>

                                  {/* Multi-Select Toggle */}
                                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button 
                                      onClick={() => updateGroupField(group.id, 'multiSelect', false)}
                                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!group.multiSelect ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                                    >
                                      Single (1)
                                    </button>
                                    <button 
                                      onClick={() => updateGroupField(group.id, 'multiSelect', true)}
                                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${group.multiSelect ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                                    >
                                      Multi (+)
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* DROPPABLE AREA FOR OPTIONS */}
                              <Droppable droppableId={group.id} type="OPTION">
                                {(provided) => (
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-3 bg-gray-50/50 p-4 rounded-2xl"
                                  >
                                    <div className="flex px-2">
                                      <AnatomyText.Label className="flex-1 text-xs uppercase text-gray-400">Option Name</AnatomyText.Label>
                                      <AnatomyText.Label className="w-24 text-right text-xs uppercase text-gray-400">Price (+$)</AnatomyText.Label>
                                      <span className="w-8"></span>
                                    </div>
                                    
                                    {group.options.map((option, optIndex) => (
                                      <Draggable key={option.id} draggableId={option.id} index={optIndex}>
                                        {(provided) => (
                                          <div 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center gap-4"
                                          >
                                            <div className="flex-1 flex items-center gap-3">
                                              
                                              {/* Drag Handle for Option */}
                                              <div 
                                                {...provided.dragHandleProps}
                                                className="cursor-grab active:cursor-grabbing"
                                              >
                                                <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                                              </div>

                                              {group.multiSelect ? (
                                                <CheckSquare className="w-4 h-4 text-gray-300" />
                                              ) : (
                                                <CircleDot className="w-4 h-4 text-gray-300" />
                                              )}
                                              <div className="flex-1">
                                                <AnatomyTextField 
                                                  placeholder="e.g. Mushrooms"
                                                  value={option.name}
                                                  onChange={(e) => updateOption(group.id, option.id, 'name', e.target.value)}
                                                  className="bg-white"
                                                />
                                              </div>
                                            </div>
                                            
                                            <div className="w-24">
                                              <AnatomyTextField 
                                                type="number"
                                                placeholder="0.00"
                                                value={option.price}
                                                onChange={(e) => updateOption(group.id, option.id, 'price', e.target.value)}
                                                className="text-right bg-white"
                                              />
                                            </div>
                                            
                                            <button 
                                              onClick={() => removeOption(group.id, option.id)}
                                              className="w-8 flex justify-end text-gray-300 hover:text-red-500"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    <button 
                                      onClick={() => addOption(group.id)}
                                      className="text-xs font-bold text-primary flex items-center mt-2 px-2 hover:underline"
                                    >
                                      <Plus className="w-3 h-3 mr-1" /> Add Option
                                    </button>
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>

        </div>

        {/* --- RIGHT COLUMN: MEDIA --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <AnatomyText.H3 className="mb-4">Dish Photo</AnatomyText.H3>
             
             <div className="relative group">
               {imagePreview ? (
                 <div className="w-full aspect-square rounded-2xl overflow-hidden relative border border-gray-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <AnatomyText.Small className="text-white font-bold">Click to Change</AnatomyText.Small>
                    </div>
                 </div>
               ) : (
                 <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 group-hover:bg-gray-100 transition-colors pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <AnatomyText.Small className="font-bold">Upload Image</AnatomyText.Small>
                    <AnatomyText.Label className="mt-1 font-normal">PNG, JPG up to 5MB</AnatomyText.Label>
                 </div>
               )}
               
               <input 
                 type="file" 
                 accept="image/*"
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={handleImageChange}
               />
             </div>
          </div>
        
        </div>

      </div>
    </div>
  );
};

export default AddProductPage;