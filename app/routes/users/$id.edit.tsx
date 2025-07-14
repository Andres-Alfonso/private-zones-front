// app/routes/users/$id.edit.tsx

import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useParams } from "@remix-run/react";
import { UsersAPI } from "~/api/endpoints/users";
import { BackendUser, EditLoaderData, userToFormData } from "~/api/types/user.types";
import UserForm from "~/components/users/UserForm";
import type { LoaderData, ActionData, UserFormData } from "~/components/users/types/user-form.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Editar Usuario - Admin Panel" },
    { name: "description", content: "Editar información del usuario" },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.id;
  
  if (!userId) {
    throw new Response("Usuario no encontrado", { status: 404 });
  }

  try {
    console.log('Cargando usuario con ID:', userId);
    
    // Realizar llamadas paralelas a la API
    const [userFromAPI, tenants, roles] = await Promise.all([
      UsersAPI.getById(userId),
      UsersAPI.getTenants(),
      UsersAPI.getRoles()
    ]);

    console.log('Usuario crudo del API:', userFromAPI);

    // Convertir los datos del backend al formato del formulario
    const user = userToFormData(userFromAPI as BackendUser);

    console.log('Usuario convertido para formulario:', user);

    return json<EditLoaderData>({ user, tenants, roles });
  } catch (error: any) {
    console.error('Error loading user:', error);
    
    let errorMessage = 'Error al cargar el usuario';
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMessage = 'No autorizado. Inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para editar este usuario.';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado.';
          break;
        default:
          errorMessage = error.response.data?.message || 'Error del servidor';
      }
    }
    
    throw new Response(errorMessage, { status: error.response?.status || 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.id;
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  if (!userId) {
    throw new Response("Usuario no encontrado", { status: 404 });
  }

  // Procesar roles múltiples
  const roles = formData.getAll('roles').filter(role => role !== '');
  
  // Validaciones básicas (sin contraseña ya que es opcional en edición)
  const errors: ActionData["errors"] = {};
  
  if (!data.email || typeof data.email !== "string") {
    errors.email = "El email es requerido";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "El email no tiene un formato válido";
  }

  // Solo validar contraseña si se proporcionó
  if (data.password && typeof data.password === "string" && data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  if (!data.name || typeof data.name !== "string") {
    errors.name = "El nombre es requerido";
  }

  if (!data.tenantId || typeof data.tenantId !== "string") {
    errors.tenantId = "Debe seleccionar un tenant";
  }

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors, values: data }, { status: 400 });
  }

  try {
    // Construir el objeto usuario con todos los datos
    const userData: Partial<UserFormData> = {
      // Datos básicos
      email: String(data.email),
      name: String(data.name),
      lastName: String(data.lastName),
      tenantId: String(data.tenantId),
      isActive: data.isActive === 'true',
      roleIds: roles.map(r => String(r)),

      profileConfig: {
        bio: String(data.bio),
        phoneNumber: String(data.phoneNumber),
        type_document: String(data.type_document),
        documentNumber: String(data.documentNumber),
        organization: String(data.organization),
        charge: String(data.charge),
        gender: String(data.gender),
        city: String(data.city),
        country: String(data.country),
        address: String(data.address),
        dateOfBirth: String(data.dateOfBirth),
      },

      // Notificaciones
      notificationConfig: {
        enableNotifications: data.enableNotifications === 'on',
        smsNotifications: data.smsNotifications === 'on',
        browserNotifications: data.browserNotifications === 'on',
        securityAlerts: data.securityAlerts === 'on',
        accountUpdates: data.accountUpdates === 'on',
        systemUpdates: data.systemUpdates === 'on',
        marketingEmails: data.marketingEmails === 'on',
        newsletterEmails: data.newsletterEmails === 'on',
        reminders: data.reminders === 'on',
        mentions: data.mentions === 'on',
        directMessages: data.directMessages === 'on',
      },
    };

    // Solo incluir contraseña si se proporcionó
    if (data.password && typeof data.password === "string" && data.password.trim() !== "") {
      userData.password = data.password;
    }

    // Llamada a tu API para actualizar el usuario
    const updatedUser = await UsersAPI.update(userId, userData);

    if (!updatedUser) {
      return json<ActionData>({
        errors: { general: "Error al actualizar usuario. Intente nuevamente." },
        values: data
      }, { status: 500 });
    }
    
    console.log('Datos del usuario a actualizar:', userData);
    
    // Simular éxito
    return redirect(`/users/${userId}`);
  } catch (error) {
    let errorMessage = "Error al actualizar el usuario.";
  
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("Error del servidor:", axiosError.response?.data);
      errorMessage = axiosError.response?.data?.message || errorMessage;
    } else {
      console.error("Error desconocido:", error);
    }

    return json<ActionData>({
      errors: { general: errorMessage },
      values: data,
    }, { status: 500 });
  }
};

export default function EditUser() {
  const { user, tenants, roles } = useLoaderData<EditLoaderData>();
  const actionData = useActionData<ActionData>();
  const params = useParams();

  return (
    <UserForm
      mode="edit"
      initialData={user}
      actionData={actionData}
      loaderData={{ tenants, roles }}
    />
  );
}