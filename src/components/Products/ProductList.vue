<template>
  <div>
    <a-button type="primary" @click="showCreateModal">Crear Producto</a-button>

    <a-table
      :columns="columns"
      :data-source="products"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      class="mt-4"
    >
      <template #bodyCell="{ column, record }">
        <!-- Nombre y SKU -->
        <template v-if="column.key === 'name'">
          <div class="product-name">
            <strong>{{ record.name }}</strong>
            <div class="text-muted">SKU: {{ record.sku }}</div>
          </div>
        </template>

        <!-- Precio y descuento -->
        <template v-if="column.key === 'price'">
          <div>
            <div v-if="record.discount" class="discounted-price">
              <span class="original-price">${{ record.basePrice }}</span>
              <span class="current-price">
                ${{
                  calculateDiscountedPrice(record.basePrice, record.discount)
                }}
              </span>
              <a-tag color="red" class="discount-tag">
                {{
                  record.discount.type === "percentage"
                    ? `${record.discount.value}%`
                    : `-$${record.discount.value}`
                }}
              </a-tag>
            </div>
            <div v-else>${{ record.basePrice }}</div>
          </div>
        </template>

        <!-- Categoría -->
        <template v-if="column.key === 'category'">
          <a-tag v-if="record.category" color="blue">
            {{ record.category.name }}
          </a-tag>
          <span v-else>Sin categoría</span>
        </template>

        <!-- Marca -->
        <template v-if="column.key === 'brand'">
          <a-tag v-if="record.brand" color="geekblue">
            {{ record.brand.name }}
          </a-tag>
          <span v-else>Sin marca</span>
        </template>

        <!-- Estado -->
        <template v-if="column.key === 'status'">
          <a-tag :color="record.isDisabled ? 'red' : 'green'">
            {{ record.isDisabled ? "Deshabilitado" : "Habilitado" }}
          </a-tag>
        </template>

        <!-- Acciones -->
        <template v-if="column.key === 'actions'">
          <a-button @click="showEditModal(record)">Editar</a-button>
          <a-button @click="handleToggleProductStatus(record.id)">
            {{ record.isDisabled ? "Habilitar" : "Deshabilitar" }}
          </a-button>
        </template>

        <template v-if="column.key === 'delete'">
          <a-button danger @click="showDeleteConfirm(record.id)">
            Eliminar
          </a-button>
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
      <p>¿Estás seguro de que deseas eliminar este producto?</p>
    </a-modal>

    <!-- Modal para crear/editar producto -->
    <ProductForm
      :visible="formModalVisible"
      :product="currentProduct"
      :mode="formMode"
      :categories="categories"
      :brands="brands"
      @submit="handleFormSubmit"
      @cancel="closeFormModal"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  getAllProducts,
  toggleProductStatus,
  deleteProduct,
  createProduct,
  updateProduct,
} from "../../services/products";
import { getCategoriesAble } from "../../services/category";
import { getBrandsAble } from "../../services/brand";
import ProductForm from "./ProductForm.vue";

export default {
  components: { ProductForm },

  setup() {
    // Estados para la tabla y modales
    const products = ref([]);
    const categories = ref([]);
    const brands = ref([]);
    const loading = ref(false);
    const deleteModalVisible = ref(false);
    const formModalVisible = ref(false);
    const productToDelete = ref(null);

    // Estados para el formulario
    const currentProduct = ref(null);
    const formMode = ref("create");

    // Configuración de la tabla
    const pagination = ref({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    const columns = [
      {
        title: "Nombre",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: "Precio",
        key: "price",
        sorter: (a, b) => a.basePrice - b.basePrice,
      },
      {
        title: "Categoría",
        key: "category",
        filters: [], // Se llenará dinámicamente
        onFilter: (value, record) => record.category?.id === value,
      },
      {
        title: "Marca",
        key: "brand",
        filters: [], // Se llenará dinámicamente
        onFilter: (value, record) => record.brand?.id === value,
      },
      {
        title: "Estado",
        key: "status",
        filters: [
          { text: "Activados", value: false },
          { text: "Desactivados", value: true },
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
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await getAllProducts();
        products.value = response || [];
        pagination.value.total = response.length;
      } catch (error) {
        message.error("Error al cargar productos");
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const fetchCategoriesAndBrands = async () => {
      try {
        const [catsResponse, brdsResponse] = await Promise.all([
          getCategoriesAble(),
          getBrandsAble(),
        ]);

        // Asegura la estructura correcta
        categories.value = catsResponse.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));

        brands.value = brdsResponse.map((brand) => ({
          id: brand.id,
          name: brand.name,
        }));
      } catch (error) {
        message.error("Error cargando categorías y marcas");
        console.error("Error details:", error);
      }
    };

    const handleTableChange = (pag) => {
      pagination.value.current = pag.current;
    };

    const calculateDiscountedPrice = (basePrice, discount) => {
      if (!discount) return basePrice;

      if (discount.type === "percentage") {
        return (basePrice * (1 - discount.value / 100)).toFixed(2);
      } else {
        return (basePrice - discount.value).toFixed(2);
      }
    };

    const showCreateModal = () => {
      currentProduct.value = {
        name: "",
        sku: "",
        shortDesc: "",
        longDesc: "",
        basePrice: 0,
        categoryId: null,
        brandId: null,
        isDisabled: false,
        gallery: [],
        attributes: [],
        variations: [],
      };

      formMode.value = "create";
      formModalVisible.value = true;
    };

    const showEditModal = (product) => {
      currentProduct.value = { ...product };
      formMode.value = "edit";
      formModalVisible.value = true;
    };

    const closeFormModal = () => {
      formModalVisible.value = false;
    };

    const handleFormSubmit = async (productData) => {
      try {
        if (formMode.value === "create") {
          await createProduct(productData);
          message.success("Producto creado correctamente");
        } else {
          await updateProduct(productData.id, productData);
          message.success("Producto actualizado correctamente");
        }
        closeFormModal();
        fetchProducts();
      } catch (error) {
        message.error(
          `Error al ${formMode.value === "create" ? "crear" : "actualizar"} producto`
        );
        console.error(error);
      }
    };

    const showDeleteConfirm = (id) => {
      productToDelete.value = id;
      deleteModalVisible.value = true;
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };

    const handleDeleteConfirm = async () => {
      if (productToDelete.value) {
        try {
          await deleteProduct(productToDelete.value);
          message.success("Producto eliminado correctamente");
          fetchProducts();
        } catch (error) {
          message.error("Error al eliminar producto");
          console.error(error);
        } finally {
          closeDeleteModal();
        }
      }
    };

    const handleToggleProductStatus = async (id) => {
      try {
        await toggleProductStatus(id);
        message.success("Estado del producto actualizado");
        fetchProducts();
      } catch (error) {
        message.error("Error al cambiar estado del producto");
        console.error(error);
      }
    };

    // Cargar datos iniciales
    onMounted(() => {
      fetchProducts();
      fetchCategoriesAndBrands();
    });

    return {
      products,
      loading,
      columns,
      pagination,
      deleteModalVisible,
      formModalVisible,
      currentProduct,
      formMode,
      categories,
      brands,
      fetchProducts,
      handleTableChange,
      calculateDiscountedPrice,
      showCreateModal,
      showEditModal,
      closeFormModal,
      handleFormSubmit,
      showDeleteConfirm,
      closeDeleteModal,
      handleDeleteConfirm,
      handleToggleProductStatus,
    };
  },
};
</script>

<style scoped>
.product-name {
  max-width: 250px;
}

.discounted-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9em;
}

.current-price {
  font-weight: bold;
  color: #ff4d4f;
}

.discount-tag {
  margin-left: 4px;
}

.text-muted {
  color: #888;
  font-size: 0.8em;
}

.mt-4 {
  margin-top: 16px;
}
</style>
