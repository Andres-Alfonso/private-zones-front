import React from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

export const HomeViewCustomizer: React.FC<SpecificViewCustomizerProps> = (props) => {
    return (
        <ViewCustomizer
            title="Configuración de Vista Home"
            description="Personaliza la apariencia de la página principal de tu tenant"
            {...props}
        />
    );
};