import React, {useEffect, useState, useRef} from 'react';
import { fabric } from 'fabric';
import { Slider } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import Icon from '@mdi/react';
import { mdiEraser } from '@mdi/js';

const Whiteboard = () => {
  
  const[sliderValue, setSliderValue] = useState(5);
  const[color, setColor] = useState('#000000');
  const[drawingMode, setDrawingMode] = useState(true);
  const[eraserMode, setEraserMode] = useState(false);
  const[eraserSlider, setEraserSlider] = useState(5);

  const canvasRef = useRef(null);  
  const canvas = useRef(null);
  const colors =['#000000', '#00FF00', '#FFFF00', '#0000FF', '#FF0000'];

  useEffect(() => {
    canvas.current = new fabric.Canvas(canvasRef.current);
    canvas.current.setHeight(window.innerHeight);
    canvas.current.setWidth(window.innerWidth);
    canvas.current.isDrawingMode = true;
    canvas.current.freeDrawingBrush.width = sliderValue;
    canvas.current.freeDrawingBrush.color = color;

    return () => canvas.current.dispose();
  },[]);

  const handlePencilChange = () => {
    setDrawingMode(!drawingMode);
    setEraserMode(false);
  };

  const handleColorChange = (newColor) => {
    canvas.current.renderAll();
    setColor(newColor);
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleClear = () => {
    canvas.current.clear();
    canvas.current.renderAll();
  };

  const handleEraserChange = () => {    
    setEraserMode(!eraserMode);
    setDrawingMode(false);
  };

  const handleEraserSliderChange = (event, newValue) => {
    setEraserSlider(newValue);
  };


  useEffect(() => {
    if (eraserMode) {
      canvas.current.freeDrawingBrush = new fabric.EraserBrush(canvas.current);
      canvas.current.freeDrawingBrush.width = eraserSlider;
      canvas.current.isDrawingMode = true; 
    } else {
      canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
      canvas.current.freeDrawingBrush.color = color; 
      canvas.current.freeDrawingBrush.width = sliderValue;
      canvas.current.isDrawingMode = drawingMode;
    }
    canvas.current.renderAll();
  }, [eraserMode, color, drawingMode, eraserSlider, sliderValue]);

  return(
    <div>
      <div className='tool-container'>
        <div className='brush-container'>
          <button className={`button-basic button-special ${drawingMode?'button-active':''}`} onClick={handlePencilChange}
            style={{backgroundColor: `${color}`}}
          ><ModeEditIcon sx={{color: 'white', width: '1.1rem'}}/></button>
          <Slider size="small" aria-label="pencil-slider" value={sliderValue} onChange={handleSliderChange} 
            sx={{width: '20%', color: '#343343'}}
            min={1}
            max={24}
            valueLabelDisplay='auto'
          />
          {colors.map((colorSelection, colorid) => {
            return <button key={colorid} className="button-basic" onClick={() => handleColorChange(colorSelection)}
            style={{backgroundColor: `${colorSelection}`}}  
          >{colorSelection === color ? <CheckIcon sx={{color: 'white', width: '1.1rem'}}/> : ''}</button>
          })}
          <button className='button-special button-basic' onClick={handleClear}><DeleteIcon sx={{width: '1rem'}}/></button>
        </div>
        <div className='eraser-container'>
          <button className={`button-basic button-special ${eraserMode?'button-active':''}`} 
            onClick={handleEraserChange}>
              <Icon path={mdiEraser} size={1} />
            </button>
          <Slider size="small" aria-label="eraser-slider" value={eraserSlider} onChange={handleEraserSliderChange} 
            sx={{width: '20%', color: '#343343'}}
            min={1}
            max={40}
            valueLabelDisplay='auto'
          />
        </div>
      </div>
      <canvas id='canvas' ref={canvasRef}/>
    </div>
  );
}


export default Whiteboard;
