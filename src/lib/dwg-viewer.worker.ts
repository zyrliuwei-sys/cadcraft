import { DxfViewer } from 'dxf-viewer';

// Geometry preparation stays off the UI thread, just like DWG conversion.
DxfViewer.SetupWorker();
