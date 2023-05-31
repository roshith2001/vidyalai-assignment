import React, {useEffect, useState, useRef} from 'react';
import { fabric } from 'fabric';
import { Slider, Tooltip, IconButton } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import InfoIcon from '@mui/icons-material/Info';
import Icon from '@mdi/react';
import { mdiEraser } from '@mdi/js';

import { database } from '../firebase';
import { ref, set, remove } from "firebase/database";



const Whiteboard = () => {
  
  const[sliderValue, setSliderValue] = useState(5);
  const[color, setColor] = useState('#000000');
  const[drawingMode, setDrawingMode] = useState(true);
  const[eraserMode, setEraserMode] = useState(false);
  const[highlighterMode, setHighlighterMode] = useState(false);
  const[eraserSlider, setEraserSlider] = useState(5);
  const [previousCanvases, setPreviousCanvases] = useState([]);

  const canvasRef = useRef();  
  const canvas = useRef();

  const colors =['#000000', '#00FF00', '#FFFF00', '#0000FF', '#FF0000'];
  const instructions =  'Use mouse wheel to Zoom, Use alt+mouse move for panning';

  useEffect(() => {
    canvas.current = new fabric.Canvas(canvasRef.current);
    canvas.current.setHeight(window.innerHeight);
    canvas.current.setWidth(window.innerWidth);
    canvas.current.isDrawingMode = true;
    canvas.current.freeDrawingBrush.width = sliderValue;
    canvas.current.freeDrawingBrush.color = color;


    return () => canvas.current.dispose();
  },[previousCanvases]);

  
  const handlePencilChange = () => {
    setDrawingMode(!drawingMode);
    setHighlighterMode(false);
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
    remove(ref(database))
      .then(() => {
        console.log('Database cleared successfully.');
      })
      .catch((error) => {
        console.error('Error clearing the database:', error);
      });
  };

  const handleEraserChange = () => {    
    setEraserMode(!eraserMode);
    setHighlighterMode(false);
    setDrawingMode(false);
  };

  const handleEraserSliderChange = (event, newValue) => {
    setEraserSlider(newValue);
  };

  const handleHighlighterChange = () => {
    setHighlighterMode(!highlighterMode);
    setEraserMode(false);
    setDrawingMode(false);
  }

  const handleChangeCanvas = () => {
    setPreviousCanvases((prevCanvases) => [...prevCanvases, canvas.current.toJSON()]);
  }

  const handlePreviousCanvas = (canvasData) => {
    canvas.current.loadFromJSON(canvasData, () => {
      canvas.current.renderAll();
    });
  };

  const handleShape = (shape) => {
    if(shape === 'R'){
      canvas.current.add(new fabric.Rect({ width: 100, height: 100, top: 100, left: 100, fill: color }));
    }
    if(shape === 'T'){
      canvas.current.add(new fabric.Triangle({ width: 100, height: 100, top: 100, left: 100, fill: color }));
    }
    if(shape === 'C'){
      canvas.current.add(new fabric.Circle({ radius: 50, top: 100, left: 100, fill: color }));
    }
  }

  const saveDrawingData = (pathData) => {
    set(ref(database), {
      path: pathData,
    });
    console.log('Saved Succesfully')
  };


  useEffect(() => {
    if (eraserMode) {
      canvas.current.freeDrawingBrush = new fabric.EraserBrush(canvas.current);
      canvas.current.freeDrawingBrush.width = eraserSlider;
      canvas.current.isDrawingMode = true; 
    } 
    else if(highlighterMode){
      canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
      canvas.current.freeDrawingBrush.color = '#FFFF00'; 
      canvas.current.freeDrawingBrush.decimate = 5; 
      canvas.current.freeDrawingBrush.width = sliderValue;
      canvas.current.isDrawingMode = true;
    }
    else {
      canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
      canvas.current.freeDrawingBrush.color = color; 
      canvas.current.freeDrawingBrush.width = sliderValue;
      canvas.current.isDrawingMode = drawingMode;
    }
    if (canvas.current) {
      canvas.current.on('path:created', async (e) => {
        const path = e.path.toJSON();
        await saveDrawingData(path);
      });
    }

   if(canvas.current){
    canvas.current.on('mouse:wheel', function(opt) {
      var delta = opt.e.deltaY;
      var zoom = canvas.current.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.current.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    canvas.current.on('mouse:down', function(opt) {
      var evt = opt.e;
      if (evt.altKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });
    canvas.current.on('mouse:move', function(opt) {
      if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });
    canvas.current.on('mouse:up', function(opt) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });
    

   }

    canvas.current.renderAll();
  }, [eraserMode, color, drawingMode, eraserSlider, sliderValue, highlighterMode]);

  return(
    <div>
      <div className='tool-container'>
        <div className='brush-container'>
          <Tooltip disableFocusListener title='Pencil'>
            <button className={`button-basic button-special ${drawingMode?'button-active':''}`} onClick={handlePencilChange}
              style={{backgroundColor: `${color}`}}
            ><ModeEditIcon sx={{color: 'white', width: '1.1rem'}}/></button>
          </Tooltip>
          <Slider size="small" aria-label="pencil-slider" value={sliderValue} onChange={handleSliderChange} 
            sx={{width: '20%', color: '#343343', marginInline: '5px'}}
            min={1}
            max={24}
            valueLabelDisplay='auto'
          />
          {colors.map((colorSelection, colorid) => {
            return <button key={colorid} className="button-basic" onClick={() => handleColorChange(colorSelection)}
            style={{backgroundColor: `${colorSelection}`}}  
          >{colorSelection === color ? <CheckIcon sx={{color: 'white', width: '1.1rem'}}/> : ''}</button>
          })}
          <Tooltip disableFocusListener title='Clear Canvas'>
            <button className='button-special button-basic' onClick={handleClear}><DeleteIcon sx={{width: '1rem'}}/></button>
          </Tooltip>
        </div>
        <div className='eraser-container'>
          <Tooltip disableFocusListener title='Eraser'>
            <button className={`button-basic button-special ${eraserMode?'button-active':''}`} 
              onClick={handleEraserChange}>
                <Icon path={mdiEraser} size={1} />
              </button>
          </Tooltip>
          <Slider size="small" aria-label="eraser-slider" value={eraserSlider} onChange={handleEraserSliderChange} 
            sx={{width: '20%', color: '#343343'}}
            min={1}
            max={40}
            valueLabelDisplay='auto'
          />
          <Tooltip disableFocusListener title='Highlighter'>
            <button className={`button-basic button-special ${highlighterMode?'button-active':''}`} 
              onClick={handleHighlighterChange}>
                <BorderColorIcon sx={{width: '1rem'}}/>
              </button>
          </Tooltip>
            <Tooltip  title={instructions} >
              <IconButton><InfoIcon /></IconButton>
            </Tooltip>
        </div>
      </div>
      <canvas id='canvas' ref={canvasRef}/>
      <div className='shapes'>
        <button className="button-special" style={{width: 'fit-content'}} onClick={() => handleShape('R')}>Rectangle</button>
        <button className="button-special" style={{width: 'fit-content'}} onClick={() => handleShape('T')}>Triangle</button>
        <button className="button-special" style={{width: 'fit-content'}} onClick={() => handleShape('C')}>Circle</button>
        <div className='canvas-change'>
          <button onClick={handleChangeCanvas} className="button-special" style={{width: 'fit-content'}}>Change Canvas</button>
          {previousCanvases.map((canvasData, index) => (
            <button key={index} onClick={() => handlePreviousCanvas(canvasData)} className="button-special" style={{width: 'fit-content'}}>
              Load Canvas {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Whiteboard;
