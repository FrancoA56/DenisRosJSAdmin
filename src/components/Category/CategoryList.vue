<template>
  <div>
    <a-button type="primary" @click="goToCreate">Crear Categoría</a-button>
    <a-table
      :columns="columns"
      :data-source="categories"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-button @click="goToEdit(record.id)">Editar</a-button>
          <a-button @click="toggleCategory(record.id)">
            {{ record.isDisabled ? "Habilitar" : "Deshabilitar" }}
          </a-button>
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
      <p>¿Estás seguro de que deseas eliminar esta categoría?</p>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getCategories,
  toggleCategoryStatus,
  deleteCategory,
} from "../../services/category";
import { message } from 'ant-design-vue';

export default {
  setup() {
    const router = useRouter();
    const categories = ref([]);
    const loading = ref(false);
    const deleteModalVisible = ref(false);
    const categoryToDelete = ref(null);

    // Estado para ordenamiento y paginación
    const sortState = ref({
      field: "id",
      order: "asc",
    });

    const filterState = ref({
      status: "all", // 'all', 'enabled', 'disabled'
    });

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
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Nombre",
        dataIndex: "name",
        key: "name",
        sorter: true,
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Estado",
        key: "isDisabled",
        filters: [
          { text: "Todos", value: "all" },
          { text: "Habilitados", value: "enabled" },
          { text: "Deshabilitados", value: "disabled" },
        ],
        filteredValue: filterState.value.status
          ? [filterState.value.status]
          : [],
        customRender: ({ record }) => {
          return record.isDisabled ? "❌ Deshabilitado" : "✔️ Habilitado";
        },
      },
      { title: "Acciones", key: "actions" },
    ];

    const fetchCategories = async () => {
      loading.value = true;
      try {
        const params = {
          sortBy: sortState.value.field,
          sortOrder: sortState.value.order,
          filterStatus: filterState.value.status,
          page: pagination.value.current,
          limit: pagination.value.pageSize,
        };

        const response = await getCategories(params);
        categories.value = response.data;
        pagination.value.total = response.total || response.data.length;
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleTableChange = (pag, filters, sorter) => {
      // Actualizar estado de ordenamiento
      if (sorter.field) {
        sortState.value = {
          field: sorter.field,
          order: sorter.order === "ascend" ? "asc" : "desc",
        };
      }

      // Actualizar filtro de estado (ahora maneja el array correctamente)
      if (filters.isDisabled && filters.isDisabled.length > 0) {
        filterState.value.status = filters.isDisabled[0];
      } else {
        filterState.value.status = "all";
      }

      // Actualizar paginación si cambió
      if (pag.current !== pagination.value.current) {
        pagination.value.current = pag.current;
      }

      // Volver a cargar los datos
      fetchCategories();
    };

    const goToCreate = () => {
      router.push("/dashboard/categories/create");
    };

    const goToEdit = (id) => {
      router.push(`/dashboard/categories/edit/${id}`);
    };

    const toggleCategory = async (id) => {
      try {
        await toggleCategoryStatus(id);
        await fetchCategories();
      } catch (error) {
        console.error("Error al cambiar estado:", error);
      }
    };

    const showDeleteConfirm = (id) => {
      categoryToDelete.value = id;
      deleteModalVisible.value = true;
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };

    const handleDeleteConfirm = async () => {
      if (categoryToDelete.value) {
        try {
          await deleteCategory(categoryToDelete.value);
          await fetchCategories();
          message.success('Categoría eliminada correctamente');
        } catch (error) {
          message.success("Error al eliminar:", error);
        } finally {
          closeDeleteModal();
        }
      }
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      categories,
      columns,
      loading,
      pagination,
      deleteModalVisible,
      goToCreate,
      goToEdit,
      toggleCategory,
      showDeleteConfirm,
      handleDeleteConfirm,
      closeDeleteModal,
      handleTableChange,
    };
  },
};
</script>
