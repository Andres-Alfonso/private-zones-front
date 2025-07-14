// app/routes/users/$id.edit.tsx

import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useParams } from "@remix-run/react";
import UserForm from "~/components/users/UserForm";
import type { LoaderData, ActionData, UserFormData } from "~/components/users/types/user-form.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Editar Usuario - Admin Panel" },
    { name: "description", content: "Editar información del usuario" },
  ];
};

interface EditLoaderData extends LoaderData {
  user: UserFormData;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.id;
  
  if (!userId) {
    throw new Response("Usuario no encontrado", { status: 404 });
  }

  // Aquí cargarías el usuario, tenants y roles desde tu API/base de datos
  // const user = await getUserById(userId);
  // const tenants = await getTenants();
  // const roles = await getRoles();
  
  // Datos simulados
  const user: UserFormData = {
    id: userId,
    email: "usuario@ejemplo.com",
    password: "", // No se carga la contraseña por seguridad
    name: "Juan",
    lastName: "Pérez",
    tenantId: "1",
    isActive: true,
    roles: ["2", "3"],
    
    // Perfil
    bio: "Desarrollador Full Stack con 5 años de experiencia",
    phoneNumber: "+57 300 123 4567",
    type_document: "DNI",
    documentNumber: "12345678",
    Organization: "TechCorp",
    Charge: "Senior Developer",
    Genger: "Masculino",
    City: "Bogotá",
    Country: "Colombia",
    address: "Calle 123 #45-67",
    dateOfBirth: "1990-05-15",
    
    // Notificaciones
    enableNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    securityAlerts: true,
    accountUpdates: true,
    systemUpdates: true,
    marketingEmails: false,
    newsletterEmails: false,
    reminders: true,
    mentions: true,
    directMessages: true,
  };
  
  const tenants = [
    { id: "1", name: "Tenant Principal" },
    { id: "2", name: "Tenant Secundario" },
  ];
  
  const roles = [
    { id: "1", name: "admin", description: "Administrador del sistema" },
    { id: "2", name: "moderator", description: "Moderador" },
    { id: "3", name: "user", description: "Usuario estándar" },
  ];

  return json<EditLoaderData>({ user, tenants, roles });
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
      email: data.email,
      name: data.name,
      lastName: data.lastName,
      tenantId: data.tenantId,
      isActive: data.isActive === 'true',
      roles: roles,

      // Perfil
      bio: data.bio,
      phoneNumber: data.phoneNumber,
      type_document: data.type_document,
      documentNumber: data.documentNumber,
      Organization: data.Organization,
      Charge: data.Charge,
      Genger: data.Genger,
      City: data.City,
      Country: data.Country,
      address: data.address,
      dateOfBirth: data.dateOfBirth,

      // Notificaciones
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
    };

    // Solo incluir contraseña si se proporcionó
    if (data.password && typeof data.password === "string" && data.password.trim() !== "") {
      userData.password = data.password;
    }

    // Aquí harías la llamada a tu API para actualizar el usuario
    // const updatedUser = await updateUser(userId, userData);
    
    console.log('Datos del usuario a actualizar:', userData);
    
    // Simular éxito
    return redirect(`/users/${userId}`);
  } catch (error) {
    return json<ActionData>({
      errors: { general: "Error al actualizar el usuario. Intente nuevamente." },
      values: data
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