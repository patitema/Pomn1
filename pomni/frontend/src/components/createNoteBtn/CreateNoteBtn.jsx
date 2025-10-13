// CreateNoteToggle.jsx
import React, { useState, useRef, useEffect } from 'react';
import './CreateNoteToggle.css';

export default function CreateNoteToggle() {
     const [isActive, setIsActive] = useState(false)
    const toggleNote = () => {
                setIsActive(!isActive);
            };
  return (
    <div>
        <div className={`CreateNoteContainer ${isActive ? 'active' : ''}`}>
            <h3>Создайте заметку</h3>
            <div className='CreateNote'>
                <input id='HeadName' type="text" placeholder='Заголовок' />
                <hr />
                <textarea id='NoteInfo' type="text" placeholder='Текст заметки'/>
            </div>

        </div>

        <div className={`CreateNoteBtnContainer ${isActive ? 'active' : ''}`} ><button className={`CreateNoteBtn ${isActive ? 'active' : ''}`} onClick={toggleNote}><p>+</p></button></div>
    </div>
  );
}
