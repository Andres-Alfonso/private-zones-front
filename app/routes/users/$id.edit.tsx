// app/routes/users/$id.edit.tsx

import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useParams } from "@remix-run/react";
import { AlertCircle } from "lucide-react";
import { UsersAPI } from "~/api/endpoints/users";
import { BackendUser, EditLoaderData, userToFormData } from "~/api/types/user.types";
import UserForm from "~/components/users/UserForm";
import type { LoaderData, ActionData, UserFormData } from "~/components/users/types/user-form.types";
import { useTenant } from "~/context/TenantContext";

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
    
    //throw new Response(errorMessage, { status: error.response?.status || 500 });
    return json<EditLoaderData>({
      user: null,
      tenants: [],
      roles: [],
      error: errorMessage
    }, { status: error.response?.status || 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.id;
  const formData = await request.formData();
  
  if (!userId) {
    throw new Response("Usuario no encontrado", { status: 404 });
  }

  const tenantId = formData.get("tenantId");
  if (!tenantId) {
    return json({ errors: { tenantId: "Tenant requerido" } }, { status: 400 });
  }

  // Procesar roles múltiples
  const roles = formData.getAll('roles').filter(role => role !== '');
  
  // Parsear los objetos JSON
  let profileConfig = {};
  let notificationConfig = {};
  
  try {
    const profileConfigRaw = formData.get('profileConfig');
    const notificationConfigRaw = formData.get('notificationConfig');
    
    if (profileConfigRaw && typeof profileConfigRaw === 'string') {
      profileConfig = JSON.parse(profileConfigRaw);
    }
    
    if (notificationConfigRaw && typeof notificationConfigRaw === 'string') {
      notificationConfig = JSON.parse(notificationConfigRaw);
    }
  } catch (error) {
    console.error('Error parsing config JSON:', error);
  }

  // Validaciones básicas
  const errors: ActionData["errors"] = {};
  
  const email = formData.get('email');
  const name = formData.get('name');
  const password = formData.get('password');
  
  if (!email || typeof email !== "string") {
    errors.email = "El email es requerido";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "El email no tiene un formato válido";
  }

  // Solo validar contraseña si se proporcionó
  // if (password && typeof password === "string" && password.trim() !== "" && password.length < 6) {
  //   errors.password = "La contraseña debe tener al menos 6 caracteres";
  // }

  if (!name || typeof name !== "string") {
    errors.name = "El nombre es requerido";
  }

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ 
      errors, 
      values: Object.fromEntries(formData) 
    }, { status: 400 });
  }

  try {

    const isActiveValue = formData.get('isActive');

    // Construir el objeto usuario con todos los datos
    const userData: Partial<UserFormData> = {
      email: String(email),
      name: String(name),
      lastName: String(formData.get('lastName') || ''),
      tenantId: tenantId as string,
      isActive: isActiveValue === 'true',
      roleIds: roles.map(r => String(r)),
      profileConfig,
      notificationConfig,
    };

    // Solo incluir contraseña si se proporcionó
    if (password && typeof password === "string" && password.trim() !== "") {
      userData.password = password;
    }

    console.log('Datos del usuario a actualizar:', userData);
    
    // Llamada a tu API para actualizar el usuario
    const updatedUser = await UsersAPI.update(userId, userData);

    if (!updatedUser) {
      return json<ActionData>({
        errors: { general: "Error al actualizar usuario. Intente nuevamente." },
        values: Object.fromEntries(formData)
      }, { status: 500 });
    }
    
    return redirect(`/users`);
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
      values: Object.fromEntries(formData),
    }, { status: 500 });
  }
};

export default function EditUser() {
  const { user, tenants, roles, error } = useLoaderData<EditLoaderData>();
  const actionData = useActionData<ActionData>();
  const params = useParams();

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <UserForm
      mode="edit"
      initialData={user}
      actionData={actionData}
      loaderData={{ tenants, roles }}
    />
  );
}