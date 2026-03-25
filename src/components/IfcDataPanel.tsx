import React, { useEffect, useRef } from 'react';
import * as OBC from '@thatopen/components';
import * as OBF from '@thatopen/components-front';
import * as BUI from '@thatopen/ui';
import * as CUI from '@thatopen/ui-obc';

export default function IfcDataPanel({ components }: { components: OBC.Components }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const highlighter = components.get(OBF.Highlighter);

    const [propsTable, updatePropsTable] = CUI.tables.itemsData({
      components,
      modelIdMap: {},
    });

    propsTable.dataTransform.Value = (value: string) => {
      const onClick = ({ target }: { target: BUI.Label }) => {
        navigator.clipboard.writeText(value);
        target.textContent = 'Copied!';
        setTimeout(() => {
          target.textContent = value;
        }, 500);
      };

      const onMouseOver = ({ target }: { target: BUI.Label }) => {
        target.style.color = 'var(--primary)';
      };

      const onMouseLeave = ({ target }: { target: BUI.Label }) => {
        target.style.removeProperty('color');
      };

      return BUI.html`
        <bim-label @click=${onClick} @mouseleave=${onMouseLeave} @mouseover=${onMouseOver}>
          ${value}
        </bim-label>
      `;
    };

    const onHighlight = () => {
      const selection = highlighter.selection.select;
      if (OBC.ModelIdMapUtils.isEmpty(selection)) {
        updatePropsTable({ modelIdMap: {} });
        return;
      }
      updatePropsTable({ modelIdMap: selection });
    };

    const onClear = () => updatePropsTable({ modelIdMap: {} });
    highlighter.events.select.onClear.add(onClear);
    highlighter.events.select.onHighlight.add(onHighlight);

    const section = document.createElement('bim-panel-section');
    section.setAttribute('fixed', '');
    section.setAttribute('label', 'Selection Data');
    section.appendChild(propsTable as unknown as Node);

    host.appendChild(section as unknown as Node);

    return () => {
      try {
        highlighter.events.select.onClear.remove(onClear);
        highlighter.events.select.onHighlight.remove(onHighlight);
      } catch {
        // ignore
      }
      section.remove();
    };
  }, [components]);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 12 }} />;
}

