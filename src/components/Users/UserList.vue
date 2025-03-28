<template>
  <div>
    <a-button type="primary" @click="showCreateModal">Crear Usuario</a-button>

    <a-table
      :columns="columns"
      :data-source="users"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          {{ record.firstName }} {{ record.lastName }}
        </template>

        <template v-if="column.key === 'role'">
          <a-tag :color="getRoleColor(record.role)">
            {{ record.role }}
          </a-tag>
        </template>

        <template v-if="column.key === 'status'">
          <a-tag :color="record.isDisabled ? 'red' : 'green'">
            {{ record.isDisabled ? "Deshabilitado" : "Habilitado" }}
          </a-tag>
        </template>

        <template v-if="column.key === 'actions'">
          <a-button @click="showEditModal(record)">Editar</a-button>
          <a-button @click="toggleUserStatus(record.id)">
            {{ record.isDisabled ? "Habilitar" : "Deshabilitar" }}
          </a-button>
          <a-button @click="() => openRoleModal(record)">Cambiar Rol</a-button>
        </template>
        <template v-if="column.key === 'delete'">
          <a-button danger @click="showDeleteConfirm(record.id)"
            >Eliminar</a-button
          >
        </template>
      </template>
    </a-table>

    <!-- Modal de confirmación -->
    <a-modal
      v-model:visible="deleteModalVisible"
      title="Confirmar eliminación"
      @ok="handleDeleteConfirm"
      @cancel="closeDeleteModal"
    >
      <p>¿Estás seguro de que deseas eliminar este usuario?</p>
    </a-modal>

    <!-- Modal para cambiar rol -->
    <a-modal
      v-model:visible="roleModalVisible"
      title="Cambiar Rol de Usuario"
      :confirm-loading="roleChanging"
      @ok="confirmRoleChange"
      @cancel="closeRoleModal"
    >
      <a-form layout="vertical">
        <a-form-item label="Seleccionar Nuevo Rol">
          <a-select
            v-model:value="selectedRole"
            style="width: 100%"
            placeholder="Seleccione un rol"
          >
            <a-select-option
              v-for="role in availableRoles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Modal para crear usuario -->
    <UserForm
      :visible="createModalVisible"
      :user="createForm"
      mode="create"
      @submit="handleCreate"
      @cancel="resetCreateForm"
    />

    <!-- Modal para editar usuario -->
    <UserForm
      :visible="editModalVisible"
      :user="editForm"
      mode="edit"
      @submit="handleEdit"
      @cancel="resetEditForm"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  getAllUsers,
  toggleUser,
  changeUserRol,
  register,
  editUser,
  deleteUser,
} from "../../services/auth";
import { message } from "ant-design-vue";
import UserForm from "./UserForm.vue";

export default {
  components: { UserForm },

  setup() {
    // Estados para la tabla y modales
    const users = ref([]);
    const userToDelete = ref(null);
    const loading = ref(false);
    const roleChanging = ref(false);
    const createModalVisible = ref(false);
    const editModalVisible = ref(false);
    const roleModalVisible = ref(false);
    const deleteModalVisible = ref(false);

    // Estados para el formulario
    const createForm = ref({
      email: "",
      password: "",
      role: "CLIENTE",
    });

    const editForm = ref({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bday: null,
      provincia: "",
      ciudad: "",
      direccion: "",
      numeroDireccion: "",
      codigoPostal: "",
    });

    // Estados para el cambio de rol
    const selectedRole = ref(null);
    const currentUserId = ref(null);
    const currentUserRole = ref("");

    const roles = [
      { value: "CLIENTE", label: "Cliente" },
      { value: "GESTOR", label: "Gestor" },
      { value: "ADMIN", label: "Administrador" },
    ];

    const availableRoles = ref([]);

    // Configuración de la tabla
    const pagination = ref({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: true,
      },
      {
        title: "Nombre",
        key: "name",
        sorter: (a, b) => {
          const nameA = (a.firstName || "").toLowerCase();
          const nameB = (b.firstName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a, b) => {
          const emailA = (a.email || "").toLowerCase();
          const emailB = (b.email || "").toLowerCase();
          return emailA.localeCompare(emailB);
        },
      },
      {
        title: "Rol",
        key: "role",
        filters: [
          { text: "Cliente", value: "CLIENTE" },
          { text: "Gestor", value: "GESTOR" },
          { text: "Administrador", value: "ADMIN" },
        ],
        onFilter: (value, record) => record.role === value,
      },
      {
        title: "Estado",
        key: "status",
        filters: [
          { text: "Habilitados", value: false },
          { text: "Deshabilitados", value: true },
        ],
        onFilter: (value, record) => record.isDisabled === value,
      },
      {
        title: "Acciones",
        key: "actions",
      },
      {
        title: "Eliminar",
        key: "delete",
      },
    ];

    // Métodos
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await getAllUsers();
        users.value = response;
        pagination.value.total = response.length;
      } catch (error) {
        message.error("Error al cargar usuarios");
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const handleTableChange = (pag) => {
      pagination.value.current = pag.current;
    };

    const showCreateModal = () => {
      createModalVisible.value = true;
    };

    const resetEditForm = () => {
      editModalVisible.value = false;
    };

    const resetCreateForm = () => {
      createModalVisible.value = false;
    };

    const handleCreate = async (userData) => {
      try {
        await register(userData);
        message.success("Usuario creado correctamente");
        resetCreateForm();
        fetchUsers();
      } catch (error) {
        message.error("Error al crear usuario");
        console.error(error);
      }
    };

    const handleEdit = async (userData) => {
      try {
        await editUser(userData.id, userData);
        message.success("Usuario actualizado correctamente");
        resetEditForm();
        fetchUsers();
      } catch (error) {
        message.error("Error al actualizar usuario");
        console.error(error);
      }
    };

    const showDeleteConfirm = (id) => {
      userToDelete.value = id;
      deleteModalVisible.value = true;
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };

    const handleDeleteConfirm = async () => {
      if (userToDelete.value) {
        try {
          await deleteUser(userToDelete.value);
          await fetchUsers();
          message.success("Usuario eliminado correctamente");
        } catch (error) {
          message.success("Error al eliminar:", error);
        } finally {
          closeDeleteModal();
        }
      }
    };

    const showEditModal = (user) => {
      editForm.value = { ...user };
      editModalVisible.value = true;
    };

    const openRoleModal = (user) => {
      currentUserId.value = user.id;
      currentUserRole.value = user.role;

      // Filtrar roles disponibles (excluyendo el actual)
      availableRoles.value = roles.filter((r) => r.value !== user.role);
      selectedRole.value = availableRoles.value[0]?.value || null;

      roleModalVisible.value = true;
    };

    const confirmRoleChange = async () => {
      if (!selectedRole.value) {
        message.error("Debe seleccionar un rol");
        return;
      }

      roleChanging.value = true;
      try {
        await changeUserRol(currentUserId.value, { role: selectedRole.value });
        message.success("Rol actualizado correctamente");
        fetchUsers();
        closeRoleModal();
      } catch (error) {
        message.error(error.response?.data?.error || "Error al cambiar el rol");
        console.error("Error changing role:", error);
      } finally {
        roleChanging.value = false;
      }
    };

    const closeRoleModal = () => {
      roleModalVisible.value = false;
      currentUserId.value = null;
      currentUserRole.value = "";
      selectedRole.value = null;
    };

    const toggleUserStatus = async (id) => {
      try {
        await toggleUser(id);
        message.success("Estado del usuario actualizado");
        fetchUsers();
      } catch (error) {
        message.error("Error al cambiar estado");
        console.error(error);
      }
    };

    const getRoleColor = (role) => {
      switch (role) {
        case "ADMIN":
          return "volcano";
        case "GESTOR":
          return "blue";
        case "CLIENTE":
          return "green";
        default:
          return "gray";
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      roleChanging,
      columns,
      pagination,
      createModalVisible,
      editModalVisible,
      roleModalVisible,
      createForm,
      editForm,
      selectedRole,
      availableRoles,
      deleteModalVisible,
      handleDeleteConfirm,
      showDeleteConfirm,
      handleTableChange,
      showCreateModal,
      showEditModal,
      openRoleModal,
      confirmRoleChange,
      closeRoleModal,
      handleCreate,
      handleEdit,
      toggleUserStatus,
      getRoleColor,
      resetCreateForm: () => {
        createModalVisible.value = false;
      },
      resetEditForm: () => {
        editModalVisible.value = false;
      },
    };
  },
};
</script>

<style scoped>
.ant-tag {
  margin-right: 0;
}
</style>
