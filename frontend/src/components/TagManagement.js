import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TagManagement = ({ onTagsUpdate }) => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');

  const predefinedTags = ['Car', 'Tree', 'Building', 'Person', 'Animal'];

  useEffect(() => {
    fetchTags();
  }, []);

  const checkPredefinedTag = (tag) => {
    return predefinedTags.includes(tag.name);
  }

  const getTagNameById = (tagId) => {
    const tag = tags.find(tag => tag.id === tagId);
    return tag ? tag.name : 'Unknown';
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('http://localhost:8000/api/tags/');
      setTags(response.data);
      onTagsUpdate(response.data);
      addPredefinedTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const addPredefinedTags = async (fetchedTags) => {
    for (const ptag of predefinedTags) {
      const tagExists = fetchedTags.some(tag => tag.name === ptag);
      if (!tagExists) {
        try {
          const response = await api.post('http://localhost:8000/api/tags/', { name: ptag });
          setTags(prevTags => [...prevTags, response.data]);
          onTagsUpdate(prevTags => [...prevTags, response.data]);
        } catch (error) {
          console.error(`Error adding predefined tag "${ptag}":`, error);
        }
      }
    }
  };

  const handleAddTag = async () => {
    if (newTagName.trim() === '') return;

    try {
      const response = await api.post('http://localhost:8000/api/tags/', { name: newTagName });
      setTags([...tags, response.data]);
      onTagsUpdate([...tags, response.data]);
      setNewTagName('');
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`http://localhost:8000/api/tags/${tagId}/`);
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      setTags(updatedTags);
      onTagsUpdate(updatedTags);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md font-sans flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-6 text-center">Tags</h3>
      <ul className="space-y-4 w-full">
        {tags.map(tag => (
          <li key={tag.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <span className="text-lg text-gray-800">{tag.name} <span className="text-sm text-gray-600">(Color: {tag.color})</span></span>
            {!checkPredefinedTag(tag) && (
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex space-x-4 mt-6 w-full justify-center">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name"
          className="border border-gray-300 rounded-lg px-4 py-2 flex-grow"
        />
        <button
          onClick={handleAddTag}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Tag
        </button>
      </div>
    </div>
  );
};

export default TagManagement;