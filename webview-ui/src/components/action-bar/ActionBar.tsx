import React from 'react';
import useAction from '../stores/useAction';
import './ActionBar.css';


interface ActionBar {
  validateHandler: () => void
}
const ActionBar: React.FC<ActionBar> = ({validateHandler}) => {
  const { fontSize, setFontSize, validate, toggleValidate } = useAction();

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(event.target.value));
  };

  return (
    <div className="action-bar">
      <button onClick={validateHandler} >Validate</button>
      <label>
        <input type="checkbox" checked={validate} onChange={toggleValidate} />
        Auto-Validate
      </label>
      <input
        type="range"
        min="10"
        max="30"
        value={fontSize}
        onChange={handleFontSizeChange}
      />
    </div>
  );
};

export default ActionBar;
