import React from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

export const VideoCallViewCustomizer: React.FC<SpecificViewCustomizerProps> = (props) => {
    return (
        <ViewCustomizer
            title="Configuración de Video Llamadas"
            description="Personaliza la apariencia de la vista de video llamadas"
            {...props}
        />
    );
};