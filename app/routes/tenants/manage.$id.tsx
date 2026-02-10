// app/routes/tenants/$id.edit.client.tsx

import { json, redirect, LoaderFunction, ActionFunction, redirectDocument } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate, useParams } from '@remix-run/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, X, AlertCircle, Building2, Globe, User, MapPin, Palette, ArrowLeft } from 'lucide-react';
import {
    TenantPlan,
    TenantFormData,
    UpdateTenantRequest,
    TENANT_FEATURES,
    TenantErrorResponse,
    Tenant
} from '~/api/types/tenant.types';
import { TenantsAPI } from '~/api/endpoints/tenants';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateTenantFormData, generateSlugFromName, validateSlug } from '~/utils/tenantValidation';
import NavbarCustomizer from '~/components/tenant/NavbarCustomizer';
import { HomeAdditionalSettings, ViewSettings } from '~/components/tenant/viewCustomizers/types';

import {
    HomeViewCustomizer,
    VideoCallViewCustomizer,
    MetricsViewCustomizer,
    GroupsViewCustomizer,
    SectionsViewCustomizer,
    FAQViewCustomizer,
    RegistrationViewCustomizer,
    NotificationViewCustomizer
} from '~/components/tenant/viewCustomizers';
import TermsPrivacyConfig from '~/components/tenant/RichTextEditor';
import { LoginMethod } from '~/components/tenant/viewCustomizers/RegistrationViewCustomizer';
import { BrandingSettings } from '~/components/tenant/BrandingSettings';
import { LoginRegisterCustomizer } from '~/components/tenant/viewCustomizers/LoginRegisterViewCustomizer';
import { extractBooleanFields, formDataToBoolean } from '~/utils/form-helpers';

interface LoaderData {
    tenant: Tenant;
}

interface ActionData {
    errors?: Record<string, string>;
    generalError?: string;
    success?: boolean;
    tenantId?: string;
}

export const loader: LoaderFunction = async ({ params }) => {
    const { id } = params;

    if (!id) {
        throw new Response('Tenant ID es requerido', { status: 400 });
    }

    try {
        const tenantResult = await TenantsAPI.getById(id);

        if ('error' in tenantResult) {
            throw new Response('Tenant no encontrado', { status: 404 });
        }

        return json<LoaderData>({ tenant: tenantResult });
    } catch (error) {
        console.error('Error loading tenant:', error);
        throw new Response('Error cargando el tenant', { status: 500 });
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    const { id } = params;

    if (!id) {
        return json<ActionData>({
            generalError: 'ID del tenant es requerido'
        }, { status: 400 });
    }

    const formData = await request.formData();

    // Validar formulario
    const validation = validateTenantFormData(formData);

    if (!validation.isValid) {
        const errorObject: Record<string, string> = {};
        validation.errors.forEach(error => {
            errorObject[error.field] = error.message;
        });

        return json<ActionData>({
            errors: errorObject
        }, { status: 400 });
    }

    try {

        console.log('Form Data received for tenant update:', Object.fromEntries(formData.entries()));

        // Extraer todos los campos booleanos de una vez
        const booleanFields = extractBooleanFields(formData, [
            'showNotifications',
            'showProfile',
            'allowSelfRegistration',
            'allowGoogleLogin',
            'allowFacebookLogin',
            'allowValidationStatusUsers',
            'requireLastName',
            'requirePhone',
            'requireDocumentType',
            'requireDocument',
            'requireOrganization',
            'requirePosition',
            'requireGender',
            'requireCity',
            'requireAddress',
            'enableEmailNotifications'
        ]);
        
        const tenantData: UpdateTenantRequest = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            domain: formData.get('domain') as string,
            contactEmail: formData.get('contactEmail') as string,
            plan: 'pro' as TenantPlan,
            maxUsers: Number(formData.get('maxUsers')),
            storageLimit: Number(formData.get('storageLimit')),

            // Información de contacto
            contactPerson: formData.get('contactPerson') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            country: formData.get('country') as string,
            url_portal: formData.get('url_portal') as string,
            nit: formData.get('nit') as string,

            backgroundColorNavbar: formData.get('backgroundColorNavbar') as string || '#0052cc',
            textColorNavbar: formData.get('textColorNavbar') as string || '#ffffff',
            logoNavbar: formData.get('logoNavbar') as string || 'Mi App',
            
            // Usar los booleanos convertidos
            showNotifications: booleanFields.showNotifications,
            showProfile: booleanFields.showProfile,

            // Configuración inicial
            primaryColor: formData.get('primaryColor') as string || '#0052cc',
            secondaryColor: formData.get('secondaryColor') as string || '#ffffff',
            timezone: formData.get('timezone') as string || 'America/Bogota',
            language: formData.get('language') as string || 'es',

            // Configuraciones de vistas
            homeSettings: {
                type: 'home',
                customBackground: formDataToBoolean(formData.get('homeCustomBackground')),
                backgroundType: formData.get('homeBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('homeBackgroundImage') as string || '',
                backgroundColor: formData.get('homeBackgroundColor') as string || '#eff4ff',
                additionalSettings: JSON.parse(formData.get('homeAdditionalSettings') as string || '{}')
            },
            videoCallSettings: {
                type: 'videocalls',
                customBackground: formDataToBoolean(formData.get('videoCallCustomBackground')),
                backgroundType: formData.get('videoCallBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('videoCallBackgroundImage') as string || '',
                backgroundColor: formData.get('videoCallBackgroundColor') as string || '#eff4ff',
                additionalSettings: JSON.parse(formData.get('videoCallAdditionalSettings') as string || '{}')
            },
            metricsSettings: {
                type: 'metrics',
                customBackground: formDataToBoolean(formData.get('metricsCustomBackground')),
                backgroundType: formData.get('metricsBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('metricsBackgroundImage') as string || '',
                backgroundColor: formData.get('metricsBackgroundColor') as string || '#eff4ff',
            },
            groupsSettings: {
                type: 'courses',
                customBackground: formDataToBoolean(formData.get('groupsCustomBackground')),
                backgroundType: formData.get('groupsBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('groupsBackgroundImage') as string || '',
                backgroundColor: formData.get('groupsBackgroundColor') as string || '#eff4ff',
            },
            sectionsSettings: {
                type: 'sections',
                customBackground: formDataToBoolean(formData.get('sectionsCustomBackground')),
                backgroundType: formData.get('sectionsBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('sectionsBackgroundImage') as string || '',
                backgroundColor: formData.get('sectionsBackgroundColor') as string || '#eff4ff',
                additionalSettings: JSON.parse(formData.get('SectionsAdditionalSettings') as string || '{}')
            },
            faqSettings: {
                type: 'frequentlyask',
                customBackground: formDataToBoolean(formData.get('faqCustomBackground')),
                backgroundType: formData.get('faqBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('faqBackgroundImage') as string || '',
                backgroundColor: formData.get('faqBackgroundColor') as string || '#eff4ff',
                additionalSettings: JSON.parse(formData.get('faqAdditionalSettings') as string || '{}')
            },

            loginRegisterSettings: {
                type: 'login',
                customBackground: formDataToBoolean(formData.get('loginCustomBackground')),
                backgroundType: formData.get('loginBackgroundType') as 'image' | 'color' || 'color',
                backgroundImage: formData.get('loginBackgroundImage') as string || '',
                backgroundColor: formData.get('loginBackgroundColor') as string || '#eff4ff',
                additionalSettings: JSON.parse(formData.get('loginAdditionalSettings') as string || '{}')
            },

            // Configuración de registro - usar los booleanos convertidos
            allowSelfRegistration: booleanFields.allowSelfRegistration,
            allowGoogleLogin: booleanFields.allowGoogleLogin,
            allowFacebookLogin: booleanFields.allowFacebookLogin,
            loginMethod: formData.get('loginMethod') as LoginMethod || LoginMethod.EMAIL,
            allowValidationStatusUsers: booleanFields.allowValidationStatusUsers,

            // Campos requeridos en registro
            requireLastName: booleanFields.requireLastName,
            requirePhone: booleanFields.requirePhone,
            requireDocumentType: booleanFields.requireDocumentType,
            requireDocument: booleanFields.requireDocument,
            requireOrganization: booleanFields.requireOrganization,
            requirePosition: booleanFields.requirePosition,
            requireGender: booleanFields.requireGender,
            requireCity: booleanFields.requireCity,
            requireAddress: booleanFields.requireAddress,

            // Configuración de notificaciones
            enableEmailNotifications: booleanFields.enableEmailNotifications,

            // Términos y condiciones
            termsEs: formData.get('termsEs') as string || '',
            termsEn: formData.get('termsEn') as string || '',
            privacyEs: formData.get('privacyEs') as string || '',
            privacyEn: formData.get('privacyEn') as string || '',

            faviconPath: formData.get('faviconPath') as string || '',
            logoPath: formData.get('logoPath') as string || '',
            loginBackgroundPath: formData.get('loginBackgroundPath') as string || '',
            iconPath: formData.get('iconPath') as string || '',
            logoAdditionalSettings: JSON.parse(formData.get('logoAdditionalSettings') as string || '{}'),
        };

        const tenantResult = await TenantsAPI.update(id, tenantData);

        if ('error' in tenantResult) {
            const errorMessage = getSpecificErrorMessage(tenantResult);
            const fieldErrors = getFieldErrors(tenantResult);

            return json<ActionData>({
                success: false,
                generalError: errorMessage,
                errors: fieldErrors
            });
        }

        if(tenantResult){
            return redirectDocument('/home');
        }

    } catch (error: any) {
        console.error('Error updating tenant:', error);

        return json<ActionData>({
            generalError: 'Error inesperado al actualizar el tenant'
        }, { status: 500 });
    }
};

// Función helper para obtener mensajes específicos
function getSpecificErrorMessage(error: TenantErrorResponse): string {
    switch (error.error) {
        case 'SLUG_ALREADY_EXISTS':
            return `El identificador "${error.value}" ya está en uso. Elige otro identificador.`;
        case 'DOMAIN_ALREADY_EXISTS':
            return `El dominio "${error.value}" ya está en uso. Elige otro dominio.`;
        case 'RESERVED_SLUG':
            return `El identificador "${error.value}" contiene palabras reservadas. Elige otro identificador.`;
        case 'INVALID_DOMAIN':
            return `El dominio "${error.value}" no es válido para el entorno actual.`;
        case 'DATABASE_ERROR':
            return 'Error al guardar en la base de datos. Intenta nuevamente.';
        default:
            return error.message || 'Error al actualizar el tenant';
    }
}

// Función helper para convertir errores a errores de campo
function getFieldErrors(error: TenantErrorResponse): Record<string, string> {
    if (!error.field) {
        return {
            general: getSpecificErrorMessage(error)
        };
    }

    return {
        [error.field]: getSpecificErrorMessage(error)
    };
}

// Hook personalizado para manejar el debounce
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default function ManageTenant() {
    const { tenant } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const params = useParams();
    const [activeTab, setActiveTab] = useState('home');

    const [formData, setFormData] = useState<Partial<TenantFormData>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Estado separado para cada vista con tipado correcto (inicializado con datos del tenant)
    const [homeSettings, setHomeSettings] = useState<ViewSettings>({
        type: 'home',
        customBackground: tenant.homeSettings?.customBackground || false,
        backgroundType: tenant.homeSettings?.backgroundType || 'color',
        backgroundImage: tenant.homeSettings?.backgroundImage || '',
        backgroundColor: tenant.homeSettings?.backgroundColor || '#eff4ff',
        additionalSettings: tenant.homeSettings?.additionalSettings || {
            allowCoursesHome: tenant?.homeSettings?.additionalSettings?.allowCoursesHome ?? false,
            showPrivateCourses: tenant?.homeSettings?.additionalSettings?.showPrivateCourses ?? false,
            allowSectionsHome: false,
            selectedSections: [],
            enableBanner: false,
            bannerType: 'image',
            bannerImageUrl: '',
            bannerVideoUrl: '',
            bannerPosition: 'top',
            customTitles: {
                en: 'Home',
                es: 'Inicio'
            }
        }
    });

    // Nuevo estado para usuarios disponibles (normalmente vendría de una API)
    const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string; }>>([
        // Esto normalmente vendría de una consulta a la API de usuarios del tenant
        { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com' },
        { id: '2', name: 'María González', email: 'maria@empresa.com' },
        { id: '3', name: 'Carlos López', email: 'carlos@empresa.com' },
        { id: '4', name: 'Ana Rodríguez', email: 'ana@empresa.com' }
    ]);

    const [videoCallSettings, setVideoCallSettings] = useState<ViewSettings>({
        type: 'videocalls',
        customBackground: tenant.videoCallSettings?.customBackground || false,
        backgroundType: tenant.videoCallSettings?.backgroundType || 'color',
        backgroundImage: tenant.videoCallSettings?.backgroundImage || '',
        backgroundColor: tenant.videoCallSettings?.backgroundColor || '#eff4ff',
        additionalSettings: tenant.videoCallSettings?.additionalSettings || {
            customTitles: {
                en: 'Video Calls',
                es: 'Video Llamadas'
            },
            enableInvitationLinks: true,
            invitationLinkExpiration: 60,
            allowGuestAccess: false,
            enableAllUsersReservations: false,
            requireApprovalForReservations: false,
            maxReservationDuration: 120,
            advanceBookingLimit: 30,
            videoCallAdministrators: [],
            enableAdminNotifications: true,
            enableRecording: false,
            enableScreenShare: true,
            enableChat: true,
            maxParticipants: 10,
            autoJoinAudio: false,
            autoJoinVideo: false,
            allowedTimeSlots: {
                enabled: false,
                slots: []
            }
        }
    });

    const [metricsSettings, setMetricsSettings] = useState<ViewSettings>({
        type: 'metrics',
        customBackground: tenant.metricsSettings?.customBackground || false,
        backgroundType: tenant.metricsSettings?.backgroundType || 'color',
        backgroundImage: tenant.metricsSettings?.backgroundImage || '',
        backgroundColor: tenant.metricsSettings?.backgroundColor || '#eff4ff',
    });

    const [groupsSettings, setGroupsSettings] = useState<ViewSettings>({
        type: 'courses',
        customBackground: tenant.groupsSettings?.customBackground || false,
        backgroundType: tenant.groupsSettings?.backgroundType || 'color',
        backgroundImage: tenant.groupsSettings?.backgroundImage || '',
        backgroundColor: tenant.groupsSettings?.backgroundColor || '#eff4ff',
        additionalSettings: tenant.groupsSettings?.additionalSettings || {
            customTitles: {
                en: 'Groups',
                es: 'Grupos'
            },
        }
    });

    const [sectionsSettings, setSectionsSettings] = useState<ViewSettings>({
        type: 'sections',
        customBackground: tenant.sectionsSettings?.customBackground || false,
        backgroundType: tenant.sectionsSettings?.backgroundType || 'color',
        backgroundImage: tenant.sectionsSettings?.backgroundImage || '',
        backgroundColor: tenant.sectionsSettings?.backgroundColor || '#eff4ff',
        additionalSettings: tenant.sectionsSettings?.additionalSettings || {
            customTitles: {
                en: 'Sections',
                es: 'Secciones'
            },
        }
    });

    const [faqSettings, setFaqSettings] = useState<ViewSettings>({
        type: 'frequentlyask',
        customBackground: tenant.faqSettings?.customBackground || false,
        backgroundType: tenant.faqSettings?.backgroundType || 'color',
        backgroundImage: tenant.faqSettings?.backgroundImage || '',
        backgroundColor: tenant.faqSettings?.backgroundColor || '#eff4ff',
        additionalSettings: tenant.faqSettings?.additionalSettings || {
            customTitles: {
                en: 'Frequently Asked Questions',
                es: 'Preguntas Frecuentes'
            },
            enableSearch: true,
            groupByCategory: false,
            showContactInfo: true,
            allowVoting: false,
            enableComments: false,
            questionsPerPage: 10,
            showQuestionNumbers: true,
            faqItems: [],
            allowPublicSubmissions: false,
            requireApprovalForSubmissions: true,
            showAuthor: false,
            enableEmailNotifications: true
        }
    });

    const [configActiveTab, setConfigActiveTab] = useState('registration');

    const [registrationSettings, setRegistrationSettings] = useState({
        allowSelfRegistration: tenant.config?.allowSelfRegistration ?? true,
        allowGoogleLogin: tenant.config?.allowGoogleLogin ?? false,
        allowFacebookLogin: tenant.config?.allowFacebookLogin ?? false,
        loginMethod: tenant.config?.loginMethod ?? LoginMethod.EMAIL,
        allowValidationStatusUsers: tenant.config?.allowValidationStatusUsers ?? true,
        requireLastName: tenant.config?.requireLastName ?? true,
        requirePhone: tenant.config?.requirePhone ?? true,
        requireDocumentType: tenant.config?.requireDocumentType ?? true,
        requireDocument: tenant.config?.requireDocument ?? true,
        requireOrganization: tenant.config?.requireOrganization ?? false,
        requirePosition: tenant.config?.requirePosition ?? false,
        requireGender: tenant.config?.requireGender ?? false,
        requireCity: tenant.config?.requireCity ?? false,
        requireAddress: tenant.config?.requireAddress ?? false
    });



    const [notificationSettings, setNotificationSettings] = useState({
        enableEmailNotifications: tenant.config?.enableEmailNotifications || true
    });

    const [logoSettings, setLogoSettings] = useState({
        faviconPath: tenant.config?.faviconPath || '',
        logoPath: tenant.config?.logoPath || '',
        loginBackgroundPath: tenant.config?.loginBackgroundPath || '',
        iconPath: tenant.config?.iconPath || '',
        additionalSettings: tenant.config?.logoAdditionalSettings || {
            loginLogoPath: ''
        }
    });

    const [loginRegisterSettings, setLoginRegisterSettings] = useState<ViewSettings>({
        type: 'login',
        customBackground: tenant.loginSettings?.customBackground || false,
        backgroundType: tenant.loginSettings?.backgroundType || 'color',
        backgroundImage: tenant.loginSettings?.backgroundImage || '',
        backgroundColor: tenant.loginSettings?.backgroundColor || '#eff4ff',
        // additionalSettings: {
        //     customTitles: {
        //         en: 'Login and Registration',
        //         es: 'Login y Registro'
        //     },
        //     showSocialLoginButtons: true,
        //     socialLoginProviders: {
        //         google: false,
        //         facebook: false
        //     },
        // }

        additionalSettings: tenant.loginSettings?.additionalSettings || {
            customTitles: {
                en: 'Login and Registration',
                es: 'Login y Registro'
            },
            formPosition: 'center',
            loginLogoPath: ''
        }
    });

    // Handlers individuales mejorados
    // const handleHomeChange = (field: string, value: string | boolean | File | any) => {
    //   if (field === 'additionalSettings') {
    //     setHomeSettings(prev => ({
    //       ...prev,
    //       additionalSettings: { ...prev.additionalSettings, ...value }
    //     }));
    //   } else {
    //     setHomeSettings(prev => ({ ...prev, [field]: value }));
    //   }
    // };

    const handleImageUpload = (field: string, file: File | null, setPreview: (value: string) => void) => {
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            onChange(field, result);
        };
        reader.readAsDataURL(file);
        }
    };


    const handleVideoCallChange = (field: string, value: string | boolean | File | any) => {
        if (field === 'additionalSettings') {
            setVideoCallSettings(prev => ({
                ...prev,
                additionalSettings: { ...prev.additionalSettings, ...value }
            }));
        } else {
            setVideoCallSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleMetricsChange = (field: string, value: string | boolean | File) => {
        setMetricsSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleGroupsChange = (field: string, value: string | boolean | File | any) => {
        if (field === 'additionalSettings') {
            setGroupsSettings(prev => ({
                ...prev,
                additionalSettings: { ...prev.additionalSettings, ...value }
            }));
        } else {
            setGroupsSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSectionsChange = (field: string, value: string | boolean | File | any) => {
        if (field === 'additionalSettings') {
            setSectionsSettings(prev => ({
                ...prev,
                additionalSettings: { ...prev.additionalSettings, ...value }
            }));
        } else {
            setSectionsSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFaqChange = (field: string, value: string | boolean | File | any) => {
        if (field === 'additionalSettings') {
            setFaqSettings(prev => ({
                ...prev,
                additionalSettings: { ...prev.additionalSettings, ...value }
            }));
        } else {
            setFaqSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleRegistrationChange = (field: string, value: any) => {
        setRegistrationSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleNotificationChange = (field: string, value: any) => {
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (field: string, value: any) => {
        if (field === 'additionalSettings') {
            setLogoSettings(prev => ({
                ...prev,
                additionalSettings: { ...prev.additionalSettings, ...value }
            }));
        } else {
            setLogoSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const configTabs = [
        {
            id: 'registration',
            label: 'Registro',
            component: RegistrationViewCustomizer,
            handler: handleRegistrationChange,
            settings: registrationSettings
        },
        {
            id: 'notifications',
            label: 'Notificaciones',
            component: NotificationViewCustomizer,
            handler: handleNotificationChange,
            settings: notificationSettings
        }
    ];

    const handleHomeChange = (field: string, value: string | boolean | File) => {
        setHomeSettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleLoginRegisterChange = (field: string, value: string | boolean | File | any) => {
        if (field === 'additionalSettings') {
        setLoginRegisterSettings(prev => ({
            ...prev,
            additionalSettings: { ...prev.additionalSettings, ...value }
        }));
        } else {
        setLoginRegisterSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const currentConfigTab = configTabs.find(tab => tab.id === configActiveTab);
    const CurrentConfigComponent = currentConfigTab?.component;

    const tabs = [
        {
            id: 'home',
            label: 'Home',
            component: HomeViewCustomizer,
            handler: handleHomeChange,
            settings: homeSettings,
            extraProps: {
                homeSettings: homeSettings
            }
        },
        {
            id: 'videoCall',
            label: 'Video Llamadas',
            component: VideoCallViewCustomizer,
            handler: handleVideoCallChange,
            settings: videoCallSettings,
            extraProps: {
                availableUsers: availableUsers,
                videoCallSettings: videoCallSettings
            }
        },
        {
            id: 'groups',
            label: 'Grupos',
            component: GroupsViewCustomizer,
            handler: handleGroupsChange,
            settings: groupsSettings
        },
        {
            id: 'Secciones',
            label: 'Secciones',
            component: SectionsViewCustomizer,
            handler: handleSectionsChange,
            settings: sectionsSettings,
            extraProps: {
                sectionsSettings: sectionsSettings
            }
        },
        {
            id: 'faq',
            label: 'Preguntas Frecuentes',
            component: FAQViewCustomizer,
            handler: handleFaqChange,
            settings: faqSettings,
            extraProps: {
                faqSettings: faqSettings
            }
        },
        {
            id: 'login', 
            label: 'Login y Registro', 
            component: LoginRegisterCustomizer, 
            handler: handleLoginRegisterChange,
            settings: loginRegisterSettings,
            // Props adicionales específicos para LoginRegister
            extraProps: {
                loginRegisterSettings: loginRegisterSettings
            }
        }
    ];

    const currentTab = tabs.find(tab => tab.id === activeTab);
    const CurrentComponent = currentTab?.component;

    // Inicializar formData con datos del tenant cargado
    // const [formData, setFormData] = useState<Partial<TenantFormData>>({
    //   name: tenant.name || '',
    //   slug: tenant.slug || '',
    //   domain: tenant.domain || '',
    //   contactEmail: tenant.contactEmail || '',
    //   plan: tenant.plan || TenantPlan.PRO,
    //   maxUsers: tenant.config?.maxUsers?.toString() || '5000',
    //   storageLimit: tenant.config?.storageLimit?.toString() || '150',
    //   billingEmail: tenant.billingEmail || '',

    //   contactPerson: tenant.contactInfo?.contactEmail || '',
    //   phone: tenant.contactInfo?.phone || '',
    //   address: tenant.contactInfo?.address || '',
    //   url_portal: tenant.contactInfo?.url_portal || '',
    //   nit: tenant.contactInfo?.nit || '',
    //   city: tenant.contactInfo?.city || '',
    //   country: tenant.contactInfo?.country || '',

    //   backgroundColorNavbar: tenant.componentConfigs[0]?.backgroundColor || '#0052cc',
    //   textColorNavbar: tenant.componentConfigs[0]?.textColor || '#ffffff',
    //   logoNavbar: tenant.config?.logoPath || 'K&LM',
    //   showSearch: tenant.showSearch ?? true,
    //   showNotifications: tenant.showNotifications ?? true,
    //   showProfile: tenant.showProfile ?? true,

    //   primaryColor: tenant.primaryColor || '#0052cc',
    //   secondaryColor: tenant.secondaryColor || '#ffffff',
    //   timezone: tenant.timezone || 'America/Bogota',
    //   language: tenant.language || 'es',
    //   currency: tenant.currency || 'USD',

    //   termsEs: tenant.termsEs || '',
    //   termsEn: tenant.termsEn || '',
    //   privacyEs: tenant.privacyEs || '',
    //   privacyEn: tenant.privacyEn || '',

    //   faviconPath: tenant.config?.favicon || '',
    //   logoPath: tenant.config?.logoPath || '',
    //   loginBackgroundPath: tenant.config?.loginBackgroundPath || '',
    //   iconPath: tenant.config?.iconPath || '',
    //   logoAdditionalSettings: JSON.parse(tenant.logoAdditionalSettings || '{}'),
    // });

    // Sincronizar settings cuando cambie el tenant
    useEffect(() => {

        if (tenant.viewConfigs && tenant.viewConfigs.length > 0) {
            // Buscar cada tipo de vista específica
            const homeView = tenant.viewConfigs.find(view => view.viewType === 'home');

            // Home Settings
            if (homeView) {
                setHomeSettings({
                    type: 'home',
                    customBackground: homeView.allowBackground ?? false,
                    backgroundType: (homeView.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: homeView.backgroundImagePath || '',
                    backgroundColor: homeView.backgroundColor || '#eff4ff',
                    additionalSettings: {
                        allowCoursesHome: homeView.additionalSettings?.allowCoursesHome ?? false,
                        showPrivateCourses: homeView.additionalSettings?.showPrivateCourses ?? false,
                        allowSectionsHome: homeView.additionalSettings?.allowSectionsHome ?? false,
                        selectedSections: homeView.additionalSettings?.selectedSections || [],
                        textColor: homeView.additionalSettings?.textColor || '#000000',
                        enableBanner: homeView.additionalSettings?.enableBanner ?? false,
                        bannerType: homeView.additionalSettings?.bannerType || 'image',
                        bannerImageUrl: homeView.additionalSettings?.bannerImageUrl || '',
                        bannerVideoUrl: homeView.additionalSettings?.bannerVideoUrl || '',
                        bannerPosition: homeView.additionalSettings?.bannerPosition || 'top',
                        customTitles: {
                            en: homeView.additionalSettings?.customTitles?.en || 'Home',
                            es: homeView.additionalSettings?.customTitles?.es || 'Inicio'
                        },
                        showWelcomeMessage: homeView.additionalSettings?.showWelcomeMessage ?? true,
                        showQuickActions: homeView.additionalSettings?.showQuickActions ?? true,
                        showRecentActivity: homeView.additionalSettings?.showRecentActivity ?? true,
                    }
                });
            }

            const videocalls = tenant.viewConfigs.find(view => view.viewType === 'videocalls');

            if (videocalls) {
                setVideoCallSettings({
                    type: 'videocalls',
                    customBackground: videocalls?.allowBackground || false,
                    backgroundType: (videocalls.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: videocalls?.backgroundImagePath || '',
                    backgroundColor: videocalls?.backgroundColor || '#eff4ff',
                    additionalSettings: videocalls?.additionalSettings || {
                        customTitles: {
                            en: 'Video Calls',
                            es: 'Video Llamadas'
                        },
                        enableInvitationLinks: true,
                        invitationLinkExpiration: 60,
                        allowGuestAccess: false,
                        enableAllUsersReservations: false,
                        requireApprovalForReservations: false,
                        maxReservationDuration: 120,
                        advanceBookingLimit: 30,
                        videoCallAdministrators: [],
                        enableAdminNotifications: true,
                        enableRecording: false,
                        enableScreenShare: true,
                        enableChat: true,
                        maxParticipants: 10,
                        autoJoinAudio: false,
                        autoJoinVideo: false,
                        allowedTimeSlots: {
                            enabled: false,
                            slots: []
                        }
                    }
                });
            }

            const metrics = tenant.viewConfigs.find(view => view.viewType === 'metrics');

            if (metrics) {
                setMetricsSettings({
                    type: 'metrics',
                    customBackground: metrics?.allowBackground || false,
                    backgroundType: (metrics.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: metrics?.backgroundImagePath || '',
                    backgroundColor: metrics?.backgroundColor || '#eff4ff',
                });
            }

            const sections = tenant.viewConfigs.find(view => view.viewType === 'sections');

            if (sections) {
                setSectionsSettings({
                    type: 'sections',
                    customBackground: sections?.allowBackground || false,
                    backgroundType: (sections.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: sections?.backgroundImagePath || '',
                    backgroundColor: sections?.backgroundColor || '#eff4ff',
                    additionalSettings: sections?.additionalSettings || {
                        customTitles: {
                            en: 'Sections',
                            es: 'Secciones'
                        },
                    }
                });
            }

            // const groups = tenant.viewConfigs.find(view => view.viewType === 'courses');

            const faq = tenant.viewConfigs.find(view => view.viewType === 'frequentlyask');

            if (faq) {
                setFaqSettings({
                    type: 'frequentlyask',
                    customBackground: faq?.allowBackground || false,
                    backgroundType: (faq.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: faq?.backgroundImagePath || '',
                    backgroundColor: faq?.backgroundColor || '#eff4ff',
                    additionalSettings: faq?.additionalSettings || {
                        customTitles: {
                            en: 'Frequently Asked Questions',
                            es: 'Preguntas Frecuentes'
                        },
                        enableSearch: true,
                        showContactInfo: true,
                        enableComments: false,
                        showQuestionNumbers: true,
                        faqItems: [],
                        allowPublicSubmissions: false,
                        // requireApprovalForSubmissions: true,
                        showAuthor: false,
                        // enableEmailNotifications: true
                    }
                });
            }

            const login = tenant.viewConfigs.find(view => view.viewType === 'login');

            if (login) {
                setLoginRegisterSettings({
                    type: 'login',
                    customBackground: login?.allowBackground || false,
                    backgroundType: (login.backgroundType as 'image' | 'color') || 'color',
                    backgroundImage: login?.backgroundImagePath || '',
                    backgroundColor: login?.backgroundColor || '#eff4ff',
                    additionalSettings: login?.additionalSettings || {
                        customTitles: {
                            en: 'Login and Registration',
                            es: 'Login y Registro'
                        },
                        formPosition: 'center',
                        loginLogoPath: ''
                    }
                });
            }

        }

        // Sections Settings
        // setSectionsSettings({
        //   type: 'sections',
        //   customBackground: tenant.sectionsSettings?.customBackground || false,
        //   backgroundType: tenant.sectionsSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.sectionsSettings?.backgroundImage || '',
        //   backgroundColor: tenant.sectionsSettings?.backgroundColor || '#eff4ff',
        //   additionalSettings: tenant.sectionsSettings?.additionalSettings || {
        //     customTitles: {
        //       en: 'Sections',
        //       es: 'Secciones'
        //     },
        //   }
        // });

        // Home Settings
        // setHomeSettings({
        //   type: 'home',
        //   customBackground: tenant.homeSettings?.customBackground || false,
        //   backgroundType: tenant.homeSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.homeSettings?.backgroundImage || '',
        //   backgroundColor: tenant.homeSettings?.backgroundColor || '#eff4ff',
        //   additionalSettings: tenant.homeSettings?.additionalSettings || {
        //     allowCoursesHome: tenant?.homeSettings?.additionalSettings?.allowCoursesHome ?? false,
        //     showPrivateCourses: tenant?.homeSettings?.additionalSettings?.showPrivateCourses ?? false,
        //     allowSectionsHome: tenant?.homeSettings?.additionalSettings?.allowSectionsHome ?? false,
        //     selectedSections: [],
        //     textColor: tenant?.homeSettings?.additionalSettings?.textColor || '#000000',
        //     enableBanner: false,
        //     bannerType: 'image',
        //     bannerImageUrl: '',
        //     bannerVideoUrl: '',
        //     bannerPosition: 'top',
        //     customTitles: {
        //       en: 'Home',
        //       es: 'Inicio'
        //     }
        //   }
        // });

        // VideoCall Settings
        // setVideoCallSettings({
        //   type: 'videocalls',
        //   customBackground: tenant.videoCallSettings?.customBackground || false,
        //   backgroundType: tenant.videoCallSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.videoCallSettings?.backgroundImage || '',
        //   backgroundColor: tenant.videoCallSettings?.backgroundColor || '#eff4ff',
        //   additionalSettings: tenant.videoCallSettings?.additionalSettings || {
        //     customTitles: {
        //       en: 'Video Calls',
        //       es: 'Video Llamadas'
        //     },
        //     enableInvitationLinks: true,
        //     invitationLinkExpiration: 60,
        //     allowGuestAccess: false,
        //     enableAllUsersReservations: false,
        //     requireApprovalForReservations: false,
        //     maxReservationDuration: 120,
        //     advanceBookingLimit: 30,
        //     videoCallAdministrators: [],
        //     enableAdminNotifications: true,
        //     enableRecording: false,
        //     enableScreenShare: true,
        //     enableChat: true,
        //     maxParticipants: 10,
        //     autoJoinAudio: false,
        //     autoJoinVideo: false,
        //     allowedTimeSlots: {
        //       enabled: false,
        //       slots: []
        //     }
        //   }
        // });

        // Metrics Settings
        // setMetricsSettings({
        //   type: 'metrics',
        //   customBackground: tenant.metricsSettings?.customBackground || false,
        //   backgroundType: tenant.metricsSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.metricsSettings?.backgroundImage || '',
        //   backgroundColor: tenant.metricsSettings?.backgroundColor || '#eff4ff',
        // });

        // Groups Settings
        // setGroupsSettings({
        //   type: 'courses',
        //   customBackground: tenant.groupsSettings?.customBackground || false,
        //   backgroundType: tenant.groupsSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.groupsSettings?.backgroundImage || '',
        //   backgroundColor: tenant.groupsSettings?.backgroundColor || '#eff4ff',
        //   additionalSettings: tenant.groupsSettings?.additionalSettings || {
        //     customTitles: {
        //       en: 'Groups',
        //       es: 'Grupos'
        //     },
        //   }
        // });

        // FAQ Settings
        // setFaqSettings({
        //   type: 'frequentlyask',
        //   customBackground: tenant.faqSettings?.customBackground || false,
        //   backgroundType: tenant.faqSettings?.backgroundType || 'color',
        //   backgroundImage: tenant.faqSettings?.backgroundImage || '',
        //   backgroundColor: tenant.faqSettings?.backgroundColor || '#eff4ff',
        //   additionalSettings: tenant.faqSettings?.additionalSettings || {
        //     customTitles: {
        //       en: 'Frequently Asked Questions',
        //       es: 'Preguntas Frecuentes'
        //     },
        //     enableSearch: true,
        //     groupByCategory: false,
        //     showContactInfo: true,
        //     allowVoting: false,
        //     enableComments: false,
        //     questionsPerPage: 10,
        //     showQuestionNumbers: true,
        //     faqItems: [],
        //     allowPublicSubmissions: false,
        //     requireApprovalForSubmissions: true,
        //     showAuthor: false,
        //     enableEmailNotifications: true
        //   }
        // });

        // Registration Settings
        setRegistrationSettings({
            allowSelfRegistration: tenant.config?.allowSelfRegistration ?? true,
            allowGoogleLogin: tenant.config?.allowGoogleLogin ?? false,
            allowFacebookLogin: tenant.config?.allowFacebookLogin ?? false,
            loginMethod: tenant.config?.loginMethod ?? LoginMethod.EMAIL,
            allowValidationStatusUsers: tenant.config?.allowValidationStatusUsers ?? true,
            requireLastName: tenant.config?.requireLastName ?? true,
            requirePhone: tenant.config?.requirePhone ?? true,
            requireDocumentType: tenant.config?.requireDocumentType ?? true,
            requireDocument: tenant.config?.requireDocument ?? true,
            requireOrganization: tenant.config?.requireOrganization ?? false,
            requirePosition: tenant.config?.requirePosition ?? false,
            requireGender: tenant.config?.requireGender ?? false,
            requireCity: tenant.config?.requireCity ?? false,
            requireAddress: tenant.config?.requireAddress ?? false
        });

        // Notification Settings
        setNotificationSettings({
            enableEmailNotifications: tenant.config?.enableEmailNotifications || true
        });

        // Logo Settings
        setLogoSettings({
            faviconPath: tenant.config?.faviconPath || '',
            logoPath: tenant.config?.logoPath || '',
            loginBackgroundPath: tenant.config?.loginBackgroundPath || '',
            iconPath: tenant.config?.iconPath || '',
            additionalSettings: tenant.config?.logoAdditionalSettings || {
                loginLogoPath: ''
            }
        });

        // FormData
        setFormData({
            name: tenant.name || '',
            slug: tenant.slug || '',
            domain: tenant.domain || '',
            contactEmail: tenant.contactEmail || '',
            plan: tenant.plan || TenantPlan.PRO,
            maxUsers: tenant.config?.maxUsers?.toString() || '5000',
            storageLimit: tenant.config?.storageLimit?.toString() || '150',
            billingEmail: tenant.billingEmail || '',

            contactPerson: tenant.contactInfo?.contactEmail || '',
            phone: tenant.contactInfo?.phone || '',
            address: tenant.contactInfo?.address || '',
            url_portal: tenant.contactInfo?.url_portal || '',
            nit: tenant.contactInfo?.nit || '',
            city: tenant.contactInfo?.city || '',
            country: tenant.contactInfo?.country || '',

            backgroundColorNavbar: tenant.componentConfigs[0]?.backgroundColor || '#0052cc',
            textColorNavbar: tenant.componentConfigs[0]?.textColor || '#ffffff',
            logoNavbar: tenant.config?.logoPath || 'K&LM',
            showSearch: tenant.showSearch ?? true,
            showNotifications: tenant.showNotifications ?? true,
            showProfile: tenant.showProfile ?? true,

            primaryColor: tenant.config?.primaryColor || '#0052cc',
            secondaryColor: tenant.config?.secondaryColor || '#ffffff',
            timezone: tenant.timezone || 'America/Bogota',
            language: tenant.language || 'es',
            currency: tenant.currency || 'USD',

            termsEs: tenant.termsEs || '',
            termsEn: tenant.termsEn || '',
            privacyEs: tenant.privacyEs || '',
            privacyEn: tenant.privacyEn || '',

            faviconPath: tenant.config?.faviconPath || '',
            logoPath: tenant.config?.logoPath || '',
            loginBackgroundPath: tenant.config?.loginBackgroundPath || '',
            iconPath: tenant.config?.iconPath || '',
            logoAdditionalSettings: JSON.parse(tenant.logoAdditionalSettings || '{}'),
        });
    }, [tenant]); // Se ejecuta cada vez que tenant cambie

    // console.log('TENANT: ', tenant);

    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    // const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);

    const isSubmitting = navigation.state === 'submitting';

    // Refs para evitar ciclos infinitos
    const previousNameRef = useRef('');
    const isInternalUpdateRef = useRef(false);

    // Debounce del nombre para evitar múltiples ejecuciones
    const debouncedName = useDebounce(formData.name || '', 300);

    // Auto-generar slug cuando cambia el nombre
    // useEffect(() => {
    //   if (debouncedName === previousNameRef.current) return;

    //   if (debouncedName && !isSlugManuallyEdited) {
    //     const generatedSlug = generateSlugFromName(debouncedName);

    //     if (generatedSlug !== formData.slug) {
    //       isInternalUpdateRef.current = true;
    //       setFormData(prev => ({ ...prev, slug: generatedSlug }));

    //       setTimeout(() => {
    //         isInternalUpdateRef.current = false;
    //       }, 0);
    //     }
    //   }

    //   previousNameRef.current = debouncedName;
    // }, [debouncedName, isSlugManuallyEdited, formData.slug]);

    // Validar slug en tiempo real
    useEffect(() => {
        if (formData.slug) {
            const slugError = validateSlug(formData.slug);
            if (slugError) {
                setClientErrors(prev => ({ ...prev, slug: slugError }));
            } else {
                setClientErrors(prev => ({ ...prev, slug: '' }));
            }
        }
    }, [formData.slug]);

    // Mostrar mensaje de éxito si se actualizó correctamente
    useEffect(() => {
        if (actionData?.success) {
            // Puedes mostrar un toast o notificación aquí
            console.log('Tenant actualizado exitosamente');
        }
    }, [actionData]);

    // Combinar errores del servidor y del cliente
    const allErrors = {
        ...clientErrors,
        ...(actionData?.errors || {})
    };

    // Obtener error por campo
    const getErrorByField = (field: string): string | null => {
        const error = allErrors[field];
        return error && error.trim() !== '' ? error : null;
    };

    // Manejar cambios en el formulario
    const handleChange = useCallback((field: string, value: string | boolean) => {
        // Si están editando el slug manualmente, marcarlo como editado
        if (field === 'slug' && !isInternalUpdateRef.current) {
            setIsSlugManuallyEdited(true);
        }

        setFormData(prev => ({ ...prev, [field]: value }));

        // Limpiar errores cuando el usuario empiece a escribir/cambiar
        if (allErrors[field]) {
            setClientErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [allErrors]);

    // const handleRegenerateSlug = useCallback(() => {
    //   if (formData.name) {
    //     const newSlug = generateSlugFromName(formData.name);
    //     isInternalUpdateRef.current = true;
    //     setFormData(prev => ({ ...prev, slug: newSlug }));
    //     setIsSlugManuallyEdited(false);

    //     setTimeout(() => {
    //       isInternalUpdateRef.current = false;
    //     }, 0);
    //   }
    // }, [formData.name]);

    // Lista de países
    const countries = [
        'Colombia', 'España', 'México', 'Argentina', 'Chile', 'Perú',
        'Estados Unidos', 'Canadá', 'Brasil', 'Uruguay', 'Venezuela'
    ];

    // Lista de idiomas
    const languages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
    ];

    // Lista de monedas
    const currencies = [
        { code: 'USD', name: 'USD - Dólar estadounidense' },
        { code: 'EUR', name: 'EUR - Euro' },
        { code: 'COP', name: 'COP - Peso colombiano' },
        { code: 'MXN', name: 'MXN - Peso mexicano' },
        { code: 'ARS', name: 'ARS - Peso argentino' },
    ];

    return (
        <div className="max-w-6xl mx-auto my-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <button
                                onClick={() => navigate('/home')}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-1" />
                                <span className="text-sm">Volver a Inicio</span>
                            </button>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Gestionar Cliente: {tenant.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Edita la configuración y personalización del cliente
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right text-sm text-gray-500">
                            <div>Última actualización:</div>
                            <div>{new Date(tenant.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-5 w-5" />
                            <span>Cancelar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mensajes de estado */}
            {actionData?.generalError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {actionData.generalError}
                </div>
            )}

            {actionData?.success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                    <div className="h-5 w-5 mr-2 rounded-full bg-green-200 flex items-center justify-center">
                        ✓
                    </div>
                    Tenant actualizado exitosamente
                </div>
            )}

            {/* Formulario */}
            <Form method="post" className="space-y-8" noValidate>
                {/* Información básica */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        {/* Nombre y Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                label="Nombre del Cliente"
                                required
                                error={getErrorByField('name')}
                                disabled={isSubmitting}
                                placeholder="Ej: Empresa ABC"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />

                            <Input
                                type="text"
                                id="slug"
                                name="slug"
                                label="Slug (identificador único)"
                                required
                                error={getErrorByField('slug')}
                                disabled={true}
                                placeholder="empresa-abc"
                                value={formData.slug || ''}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                helperText="El slug no puede ser modificado después de la creación"
                            />
                        </div>

                        {/* Dominio y Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                id="domain"
                                name="domain"
                                label="Dominio"
                                required
                                error={getErrorByField('domain')}
                                disabled={isSubmitting}
                                placeholder="empresa-abc.klmsystem.test"
                                value={formData.domain}
                                onChange={(e) => handleChange('domain', e.target.value)}
                                helperText="Dominio principal para acceder al cliente"
                            />

                            <Input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                label="Email de Contacto"
                                required
                                error={getErrorByField('contactEmail')}
                                disabled={isSubmitting}
                                placeholder="admin@empresa-abc.com"
                                value={formData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                            />
                        </div>

                        {/* Plan y Configuración */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <Input
                                type="number"
                                id="maxUsers"
                                name="maxUsers"
                                label="Máximo de Usuarios"
                                required
                                min="1"
                                error={getErrorByField('maxUsers')}
                                disabled={isSubmitting}
                                value={formData.maxUsers}
                                onChange={(e) => handleChange('maxUsers', e.target.value)}
                            />

                            <Input
                                type="number"
                                id="storageLimit"
                                name="storageLimit"
                                label="Límite de Almacenamiento (GB)"
                                required
                                min="1"
                                error={getErrorByField('storageLimit')}
                                disabled={isSubmitting}
                                value={formData.storageLimit}
                                onChange={(e) => handleChange('storageLimit', e.target.value)}
                            />
                        </div>

                        {/* Configuración regional */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                                    Idioma (Idioma por defecto en la zona)
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    disabled={isSubmitting}
                                    value={formData.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>
                            </div> */}

                            {/* <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                Moneda
                                </label>
                                <select
                                id="currency"
                                name="currency"
                                disabled={isSubmitting}
                                value={formData.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                {currencies.map(curr => (
                                    <option key={curr.code} value={curr.code}>{curr.name}</option>
                                ))}
                                </select>
                            </div> */}

                            {/* <Input
                                type="text"
                                id="timezone"
                                name="timezone"
                                label="Zona Horaria"
                                disabled={isSubmitting}
                                placeholder="America/Bogota"
                                value={formData.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                            />
                        </div> */}
                    </div>
                </div>

                {/* Información de contacto */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Información de Contacto</h2>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                label="Persona de Contacto"
                                error={getErrorByField('contactPerson')}
                                disabled={isSubmitting}
                                placeholder="Juan Pérez"
                                value={formData.contactPerson}
                                onChange={(e) => handleChange('contactPerson', e.target.value)}
                            />

                            <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                label="Teléfono"
                                error={getErrorByField('phone')}
                                disabled={isSubmitting}
                                placeholder="+57 300 123 4567"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        <Input
                            type="text"
                            id="address"
                            name="address"
                            label="Dirección"
                            error={getErrorByField('address')}
                            disabled={isSubmitting}
                            placeholder="Calle 123 #45-67"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                id="url_portal"
                                name="url_portal"
                                label="Dirección del Portal"
                                error={getErrorByField('url_portal')}
                                disabled={isSubmitting}
                                placeholder="https://portal.empresa-abc.com"
                                value={formData.url_portal}
                                onChange={(e) => handleChange('url_portal', e.target.value)}
                            />

                            <Input
                                type="text"
                                id="nit"
                                name="nit"
                                label="Nit"
                                error={getErrorByField('nit')}
                                disabled={isSubmitting}
                                placeholder="123456789"
                                value={formData.nit}
                                onChange={(e) => handleChange('nit', e.target.value)}
                            />
                        </div>

                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                id="city"
                                name="city"
                                label="Ciudad"
                                error={getErrorByField('city')}
                                disabled={isSubmitting}
                                placeholder="Bogotá"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                    País
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    disabled={isSubmitting}
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Seleccionar país</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Configuración de Registro y Notificaciones</h2>
                        </div>
                    </div>

                    {/* Tabs para configuración */}
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto px-6">
                            {configTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setConfigActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${configActiveTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenido del tab activo */}
                    <div className="p-0">
                        {CurrentConfigComponent && currentConfigTab && (
                            <CurrentConfigComponent
                                onChange={currentConfigTab.handler}
                                isSubmitting={isSubmitting}
                                errors={allErrors}
                                settings={currentConfigTab.settings}
                            />
                        )}
                    </div>
                </div>

                {/* Configuracion de terminos y condiciones */}
                <div className='bg-white shadow rounded-lg'>
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Configuracion de terminos y condiciones, politica de privacidad</h2>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        <TermsPrivacyConfig
                            formData={formData}
                            handleChange={handleChange}
                            getErrorByField={getErrorByField}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>


                <div className='bg-white shadow rounded-lg'>
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-medium text-gray-900">Configuración General</h2>
                        </div>
                    </div>

                    <BrandingSettings
                        formData={formData}
                        isSubmitting={isSubmitting}
                        previewFavicon={previewFavicon}
                        previewLogo={previewLogo}
                        languages={languages}
                        getErrorByField={getErrorByField}
                        handleChange={handleChange}
                        handleImageUpload={handleImageUpload}
                        setPreviewFavicon={setPreviewFavicon}
                        setPreviewLogo={setPreviewLogo}
                    />
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Palette className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Personalizador de barra de navegación</h2>
                        </div>
                    </div>

                    <NavbarCustomizer
                        backgroundColor={formData.backgroundColorNavbar || '#0052cc'}
                        textColor={formData.textColorNavbar || '#ffffff'}
                        logo={formData.logoNavbar || 'Mi App'}
                        showSearch={formData.showSearch || true}
                        showNotifications={formData.showNotifications || true}
                        showProfile={formData.showProfile || true}
                        onChange={handleChange}
                        isSubmitting={isSubmitting}
                        errors={allErrors}
                    />
                </div>

                <div className="bg-white shadow rounded-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Palette className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Personalizador de vistas</h2>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenido del tab activo */}
                    <div className="p-0">
                        {CurrentComponent && currentTab && (
                            <CurrentComponent
                                onChange={currentTab.handler}
                                isSubmitting={isSubmitting}
                                errors={allErrors}
                                settings={currentTab.settings}
                                initialCustomBackground={currentTab.settings.customBackground}
                                initialBackgroundType={currentTab.settings.backgroundType}
                                initialBackgroundImage={currentTab.settings.backgroundImage}
                                initialBackgroundColor={currentTab.settings.backgroundColor}
                                // Props adicionales específicos para cada vista
                                {...(currentTab.extraProps || {})}
                            />
                        )}
                    </div>
                </div>

                {/* Campos hidden para el navbar */}
                <input type="hidden" name="backgroundColorNavbar" value={formData.backgroundColorNavbar} />
                <input type="hidden" name="textColorNavbar" value={formData.textColorNavbar} />
                <input type="hidden" name="logoNavbar" value={formData.logoNavbar} />
                <input type="hidden" name="showSearch" value={formData.showSearch ? 'on' : ''} />
                <input type="hidden" name="showNotifications" value={formData.showNotifications ? 'on' : ''} />
                <input type="hidden" name="showProfile" value={formData.showProfile ? 'on' : ''} />
                <input type="hidden" name='slug' value={formData.slug} />

                <input type="hidden" name="faviconPath" value={formData.faviconPath} />
                <input type="hidden" name="logoPath" value={formData.logoPath} />
                <input type="hidden" name="loginBackgroundPath" value={formData.loginBackgroundPath} />
                <input type="hidden" name="iconPath" value={formData.iconPath} />
                <input type="hidden" name="logoAdditionalSettings" value={JSON.stringify(logoSettings.additionalSettings)} />

                {/* Campos hidden para configuraciones de vistas */}
                {/* Home Settings */}
                <input type="hidden" name="homeCustomBackground" value={homeSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="homeBackgroundType" value={homeSettings.backgroundType || 'color'} />
                <input type="hidden" name="homeBackgroundImage" value={homeSettings.backgroundImage || ''} />
                <input type="hidden" name="homeBackgroundColor" value={homeSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="homeAdditionalSettings" value={JSON.stringify(homeSettings.additionalSettings)} />

                {/* VideoCall Settings */}
                <input type="hidden" name="videoCallCustomBackground" value={videoCallSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="videoCallBackgroundType" value={videoCallSettings.backgroundType || 'color'} />
                <input type="hidden" name="videoCallBackgroundImage" value={videoCallSettings.backgroundImage || ''} />
                <input type="hidden" name="videoCallBackgroundColor" value={videoCallSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="videoCallAdditionalSettings" value={JSON.stringify(videoCallSettings.additionalSettings)} />

                {/* Metrics Settings */}
                <input type="hidden" name="metricsCustomBackground" value={metricsSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="metricsBackgroundType" value={metricsSettings.backgroundType || 'color'} />
                <input type="hidden" name="metricsBackgroundImage" value={metricsSettings.backgroundImage || ''} />
                <input type="hidden" name="metricsBackgroundColor" value={metricsSettings.backgroundColor || '#eff4ff'} />

                {/* Groups Settings */}
                <input type="hidden" name="groupsCustomBackground" value={groupsSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="groupsBackgroundType" value={groupsSettings.backgroundType || 'color'} />
                <input type="hidden" name="groupsBackgroundImage" value={groupsSettings.backgroundImage || ''} />
                <input type="hidden" name="groupsBackgroundColor" value={groupsSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="groupsAdditionalSettings" value={JSON.stringify(groupsSettings.additionalSettings)} />

                {/* Sections Settings */}
                <input type="hidden" name="sectionsCustomBackground" value={sectionsSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="sectionsBackgroundType" value={sectionsSettings.backgroundType || 'color'} />
                <input type="hidden" name="sectionsBackgroundImage" value={sectionsSettings.backgroundImage || ''} />
                <input type="hidden" name="sectionsBackgroundColor" value={sectionsSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="SectionsAdditionalSettings" value={JSON.stringify(sectionsSettings.additionalSettings)} />

                {/* FAQ Settings */}
                <input type="hidden" name="faqCustomBackground" value={faqSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="faqBackgroundType" value={faqSettings.backgroundType || 'color'} />
                <input type="hidden" name="faqBackgroundImage" value={faqSettings.backgroundImage || ''} />
                <input type="hidden" name="faqBackgroundColor" value={faqSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="faqAdditionalSettings" value={JSON.stringify(faqSettings.additionalSettings)} />

                {/* loginRegister Settings */}
                <input type="hidden" name="loginCustomBackground" value={loginRegisterSettings.customBackground ? 'true' : 'false'} />
                <input type="hidden" name="loginBackgroundType" value={loginRegisterSettings.backgroundType || 'color'} />
                <input type="hidden" name="loginBackgroundImage" value={loginRegisterSettings.backgroundImage || ''} />
                <input type="hidden" name="loginBackgroundColor" value={loginRegisterSettings.backgroundColor || '#eff4ff'} />
                <input type="hidden" name="loginAdditionalSettings" value={JSON.stringify(loginRegisterSettings.additionalSettings)} />

                {/* Registration Settings */}
                <input type="hidden" name="allowSelfRegistration" value={registrationSettings.allowSelfRegistration ? 'true' : 'false'} />
                <input type="hidden" name="allowGoogleLogin" value={registrationSettings.allowGoogleLogin ? 'true' : 'false'} />
                <input type="hidden" name="allowFacebookLogin" value={registrationSettings.allowFacebookLogin ? 'true' : 'false'} />
                <input type="hidden" name="loginMethod" value={registrationSettings.loginMethod} />
                <input type="hidden" name="allowValidationStatusUsers" value={registrationSettings.allowValidationStatusUsers ? 'true' : 'false'} />

                {/* Campos requeridos en registro */}
                <input type="hidden" name="requireLastName" value={registrationSettings.requireLastName ? 'true' : 'false'} />
                <input type="hidden" name="requirePhone" value={registrationSettings.requirePhone ? 'true' : 'false'} />
                <input type="hidden" name="requireDocumentType" value={registrationSettings.requireDocumentType ? 'true' : 'false'} />
                <input type="hidden" name="requireDocument" value={registrationSettings.requireDocument ? 'true' : 'false'} />
                <input type="hidden" name="requireOrganization" value={registrationSettings.requireOrganization ? 'true' : 'false'} />
                <input type="hidden" name="requirePosition" value={registrationSettings.requirePosition ? 'true' : 'false'} />
                <input type="hidden" name="requireGender" value={registrationSettings.requireGender ? 'true' : 'false'} />
                <input type="hidden" name="requireCity" value={registrationSettings.requireCity ? 'true' : 'false'} />
                <input type="hidden" name="requireAddress" value={registrationSettings.requireAddress ? 'true' : 'false'} />

                <input type="hidden" name="primaryColor" value={formData.primaryColor || '#0052cc'} />
                <input type="hidden" name="secondaryColor" value={formData.secondaryColor || '#ffffff'} />

                {/* Notification Settings */}
                <input type="hidden" name="enableEmailNotifications" value={notificationSettings.enableEmailNotifications ? 'true' : 'false'} />

                {/* Botones de acción */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/tenants')}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Actualizar Tenant</span>
                            </>
                        )}
                    </button>
                </div>
            </Form>
        </div>
    );
}