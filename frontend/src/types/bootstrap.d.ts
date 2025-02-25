// types/bootstrap.d.ts
interface Modal {
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    handleUpdate(): void;
  }
  
  interface BootstrapStatic {
    Modal: {
      new(element: Element, options?: object): Modal;
      getInstance(element: Element): Modal | null;
    };
    // You can add other Bootstrap components here as needed (Carousel, Tooltip, etc.)
  }
  
  declare global {
    interface Window {
      bootstrap?: BootstrapStatic;
    }
  }
  
  export {};