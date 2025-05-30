import React, {useState} from 'react'

export default function Modal(props) {
    document.onkeydown = (e) => {
        if( e.key === "Escape") {
            props.onClose()
        }
    }
  return (
    <div className={`modal ${props.show ? 'fixed' : 'hidden'} px-4 ` }
        onClick={(e) => {
            props.onClose()
        }}
        
    >
        <div 
        onClick={(e) => {
            e.stopPropagation()
        }}
        style={{width: props?.width || '', minHeight: props?.minHeight || ''}}
        className={`modalDialog  ${props.width}`}>
            {props.content}
            
        </div>
    </div>
  )
}
