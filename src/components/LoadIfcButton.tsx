import React, { useEffect, useRef } from 'react';

type BIMButtonElement = HTMLElement & {
  label?: string;
  icon?: string;
};

export default function LoadIfcButton() {
  const buttonRef = useRef<BIMButtonElement | null>(null);

  const onLoadIfc = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.ifc';
    input.click();
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    button.addEventListener('click', onLoadIfc);
    return () => button.removeEventListener('click', onLoadIfc);
  }, []);

  return React.createElement('bim-button', {
    ref: buttonRef,
    label: 'Load IFC',
    icon: 'solar:bookmark-square-minimalistic-bold',
    style: {
      width: '100%',
      marginTop: 8
    }
  });
}
