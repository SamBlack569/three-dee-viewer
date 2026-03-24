import * as OBC from '@thatopen/components';

let componentsInstance: OBC.Components | null = null;

export function getViewerComponents(): OBC.Components {
  if (!componentsInstance) {
    componentsInstance = new OBC.Components();
    componentsInstance.init();
  }

  return componentsInstance;
}
