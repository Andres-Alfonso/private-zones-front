// MultiViewCustomizer.tsx
import React from 'react';
import HomeViewCustomizer from './HomeViewCustomizer';
import VideoCallViewCustomizer from './VideoCallViewCustomizer';
import MetricsViewCustomizer from './MetricsViewCustomizer';
// Importar el resto cuando los crees:
// import GroupsViewCustomizer from './GroupsViewCustomizer';
// import SectionsViewCustomizer from './SectionsViewCustomizer';
// import FAQViewCustomizer from './FAQViewCustomizer';
import { MultiViewCustomizerProps } from './types';

const MultiViewCustomizer: React.FC<MultiViewCustomizerProps> = ({
    onHomeChange,
    onVideoCallChange,
    onMetricsChange,
    onGroupsChange,
    onSectionsChange,
    onFAQChange,
    isSubmitting = false,
    errors = {},
    initialValues = {}
}) => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6">
            {/* Título principal */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Personalización de Vistas
                </h1>
                <p className="text-gray-600">
                    Configura el fondo personalizado para cada sección de tu aplicación
                </p>
            </div>

            {/* Grid de componentes */}
            <div className="grid gap-6">
                <HomeViewCustomizer
                    onChange={onHomeChange}
                    isSubmitting={isSubmitting}
                    errors={errors.home || {}}
                    initialCustomBackground={initialValues.home?.customBackground}
                    initialBackgroundType={initialValues.home?.backgroundType}
                    initialBackgroundImage={initialValues.home?.backgroundImage}
                    initialBackgroundColor={initialValues.home?.backgroundColor}
                />
                
                <VideoCallViewCustomizer
                    onChange={onVideoCallChange}
                    isSubmitting={isSubmitting}
                    errors={errors.videoCall || {}}
                    initialCustomBackground={initialValues.videoCall?.customBackground}
                    initialBackgroundType={initialValues.videoCall?.backgroundType}
                    initialBackgroundImage={initialValues.videoCall?.backgroundImage}
                    initialBackgroundColor={initialValues.videoCall?.backgroundColor}
                />
                
                <MetricsViewCustomizer
                    onChange={onMetricsChange}
                    isSubmitting={isSubmitting}
                    errors={errors.metrics || {}}
                    initialCustomBackground={initialValues.metrics?.customBackground}
                    initialBackgroundType={initialValues.metrics?.backgroundType}
                    initialBackgroundImage={initialValues.metrics?.backgroundImage}
                    initialBackgroundColor={initialValues.metrics?.backgroundColor}
                />
                
                {/* TODO: Agregar cuando crees los componentes restantes */}
                {/*
                <GroupsViewCustomizer
                    onChange={onGroupsChange}
                    isSubmitting={isSubmitting}
                    errors={errors.groups || {}}
                    initialCustomBackground={initialValues.groups?.customBackground}
                    initialBackgroundType={initialValues.groups?.backgroundType}
                    initialBackgroundImage={initialValues.groups?.backgroundImage}
                    initialBackgroundColor={initialValues.groups?.backgroundColor}
                />
                
                <SectionsViewCustomizer
                    onChange={onSectionsChange}
                    isSubmitting={isSubmitting}
                    errors={errors.sections || {}}
                    initialCustomBackground={initialValues.sections?.customBackground}
                    initialBackgroundType={initialValues.sections?.backgroundType}
                    initialBackgroundImage={initialValues.sections?.backgroundImage}
                    initialBackgroundColor={initialValues.sections?.backgroundColor}
                />
                
                <FAQViewCustomizer
                    onChange={onFAQChange}
                    isSubmitting={isSubmitting}
                    errors={errors.faq || {}}
                    initialCustomBackground={initialValues.faq?.customBackground}
                    initialBackgroundType={initialValues.faq?.backgroundType}
                    initialBackgroundImage={initialValues.faq?.backgroundImage}
                    initialBackgroundColor={initialValues.faq?.backgroundColor}
                />
                */}
            </div>
        </div>
    );
};

export default MultiViewCustomizer;