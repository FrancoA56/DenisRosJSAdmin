<template>
  <div>
    <a-button type="primary" @click="goToCreate">Crear Marca</a-button>
    <a-table
      :columns="columns"
      :data-source="brands"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'logo'">
          <img 
            v-if="record.logo" 
            :src="record.logo" 
            alt="Logo" 
            style="max-height: 50px; max-width: 100px;"
          />
          <span v-else>Sin logo</span>
        </template>
        <template v-if="column.key === 'actions'">
          <a-button @click="goToEdit(record.id)">Editar</a-button>
          <a-button @click="toggleBrand(record.id)">
            {{ record.isDisabled ? "Habilitar" : "Deshabilitar" }}
          </a-button>
          <a-button danger @click="showDeleteConfirm(record.id)">Eliminar</a-button>
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
      <p>¿Estás seguro de que deseas eliminar esta marca?</p>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getBrands, toggleBrandStatus, deleteBrand } from "../../services/brand";
import { message } from "ant-design-vue";

export default {
  setup() {
    const router = useRouter();
    const brands = ref([]);
    const loading = ref(false);
    const deleteModalVisible = ref(false);
    const brandToDelete = ref(null);

    // Estado para ordenamiento y paginación
    const sortState = ref({
      field: "id",
      order: "asc",
    });

    const filterState = ref({
      status: "all",
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
        title: "Logo", 
        key: "logo",
        customRender: ({ record }) => {
          return record.logo 
            ? `<img src="${record.logo}" style="max-height: 50px; max-width: 100px;" />` 
            : 'Sin logo';
        }
      },
      {
        title: "Estado",
        key: "isDisabled",
        filters: [
          { text: "Todos", value: "all" },
          { text: "Habilitados", value: "enabled" },
          { text: "Deshabilitados", value: "disabled" },
        ],
        filteredValue: filterState.value.status ? [filterState.value.status] : [],
        customRender: ({ record }) => {
          return record.isDisabled ? "❌ Deshabilitado" : "✔️ Habilitado";
        },
      },
      { title: "Acciones", key: "actions" },
    ];

    const fetchBrands = async () => {
      loading.value = true;
      try {
        const params = {
          sortBy: sortState.value.field,
          sortOrder: sortState.value.order,
          filterStatus: filterState.value.status,
          page: pagination.value.current,
          limit: pagination.value.pageSize,
        };

        const response = await getBrands(params);
        brands.value = response.data || response; // Ajuste para diferentes formatos de respuesta
        pagination.value.total = response.total || (response.data ? response.data.length : response.length);
      } catch (error) {
        message.error("Error al obtener marcas");
        console.error("Error al obtener marcas:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleTableChange = (pag, filters, sorter) => {
      if (sorter.field) {
        sortState.value = {
          field: sorter.field,
          order: sorter.order === "ascend" ? "asc" : "desc",
        };
      }

      if (filters.isDisabled && filters.isDisabled.length > 0) {
        filterState.value.status = filters.isDisabled[0];
      } else {
        filterState.value.status = "all";
      }

      if (pag.current !== pagination.value.current) {
        pagination.value.current = pag.current;
      }

      fetchBrands();
    };

    const goToCreate = () => {
      router.push("/dashboard/brands/create");
    };

    const goToEdit = (id) => {
      router.push(`/dashboard/brands/edit/${id}`);
    };

    const toggleBrand = async (id) => {
      try {
        await toggleBrandStatus(id);
        await fetchBrands();
        message.success("Estado de la marca actualizado");
      } catch (error) {
        message.error("Error al cambiar estado");
        console.error("Error al cambiar estado:", error);
      }
    };

    const showDeleteConfirm = (id) => {
      brandToDelete.value = id;
      deleteModalVisible.value = true;
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };

    const handleDeleteConfirm = async () => {
      if (brandToDelete.value) {
        try {
          await deleteBrand(brandToDelete.value);
          await fetchBrands();
          message.success("Marca eliminada correctamente");
        } catch (error) {
          message.error("Error al eliminar marca");
          console.error("Error al eliminar:", error);
        } finally {
          closeDeleteModal();
        }
      }
    };

    onMounted(() => {
      fetchBrands();
    });

    return {
      brands,
      columns,
      loading,
      pagination,
      deleteModalVisible,
      goToCreate,
      goToEdit,
      toggleBrand,
      showDeleteConfirm,
      handleDeleteConfirm,
      closeDeleteModal,
      handleTableChange,
    };
  },
};
</script>